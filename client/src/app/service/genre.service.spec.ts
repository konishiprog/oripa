import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GenreService, Genre } from './genre.service';
import { ApiConfigService } from './api-config.service';

describe('GenreService', () => {
  let service: GenreService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockGenres: Genre[] = [
    { id: 'genre-1', name: 'Action' },
    { id: 'genre-2', name: 'Adventure' },
    { id: 'genre-3', name: 'Comedy' },
  ];

  const mockGenre: Genre = { id: 'genre-1', name: 'Action' };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: { 'Content-Type': 'application/json' },
    };

    TestBed.configureTestingModule({
      providers: [
        GenreService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(GenreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllGenres', () => {
    it('should fetch all genres', async () => {
      const result = service.getAllGenres();

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({ message: 'Genres fetched', data: mockGenres });

      const response = await result;
      expect(response).toEqual(mockGenres);
      expect(response).toHaveLength(3);
    });

    it('should handle empty genre list', async () => {
      const result = service.getAllGenres();

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      req.flush({ message: 'Genres fetched', data: [] });

      const response = await result;
      expect(response).toEqual([]);
      expect(response).toHaveLength(0);
    });

    it('should return empty array if response data is null', async () => {
      const result = service.getAllGenres();

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      req.flush({ message: 'Genres fetched', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should handle HTTP error', async () => {
      const result = service.getAllGenres();

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      req.error(new ErrorEvent('Network error'));

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('createGenre', () => {
    it('should create a new genre', async () => {
      const payload = { name: 'Action' };
      const result = service.createGenre(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Genre created', data: mockGenre });

      const response = await result;
      expect(response).toEqual(mockGenre);
      expect(response.id).toBe('genre-1');
      expect(response.name).toBe('Action');
    });

    it('should handle create error with 409 conflict', async () => {
      const payload = { name: 'Action' };
      const result = service.createGenre(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      req.flush(
        { message: 'Genre already exists' },
        { status: 409, statusText: 'Conflict' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(409);
      }
    });

    it('should handle create error with invalid input', async () => {
      const payload = { name: '' };
      const result = service.createGenre(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/genre');
      req.flush(
        { message: 'Invalid input' },
        { status: 400, statusText: 'Bad Request' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('updateGenre', () => {
    it('should update an existing genre', async () => {
      const payload = { name: 'Updated Action' };
      const updatedGenre = { id: 'genre-1', name: 'Updated Action' };
      const result = service.updateGenre('genre-1', payload);

      const req = httpMock.expectOne('http://localhost:3000/api/genre/genre-1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Genre updated', data: updatedGenre });

      const response = await result;
      expect(response).toEqual(updatedGenre);
      expect(response.name).toBe('Updated Action');
    });

    it('should handle update error when genre not found', async () => {
      const payload = { name: 'Updated Action' };
      const result = service.updateGenre('nonexistent-id', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/genre/nonexistent-id',
      );
      req.flush(
        { message: 'Genre not found' },
        { status: 404, statusText: 'Not Found' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it('should handle update error with duplicate name', async () => {
      const payload = { name: 'Adventure' };
      const result = service.updateGenre('genre-1', payload);

      const req = httpMock.expectOne('http://localhost:3000/api/genre/genre-1');
      req.flush(
        { message: 'Genre name already exists' },
        { status: 409, statusText: 'Conflict' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(409);
      }
    });
  });

  describe('deleteGenre', () => {
    it('should delete a genre', async () => {
      const result = service.deleteGenre('genre-1');

      const req = httpMock.expectOne('http://localhost:3000/api/genre/genre-1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Genre deleted' });

      const response = await result;
      expect(response.message).toBe('Genre deleted');
    });

    it('should handle delete error when genre not found', async () => {
      const result = service.deleteGenre('nonexistent-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/genre/nonexistent-id',
      );
      req.flush(
        { message: 'Genre not found' },
        { status: 404, statusText: 'Not Found' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it('should handle delete error when genre is in use', async () => {
      const result = service.deleteGenre('genre-1');

      const req = httpMock.expectOne('http://localhost:3000/api/genre/genre-1');
      req.flush(
        { message: 'Cannot delete genre in use' },
        { status: 409, statusText: 'Conflict' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(409);
      }
    });
  });
});
