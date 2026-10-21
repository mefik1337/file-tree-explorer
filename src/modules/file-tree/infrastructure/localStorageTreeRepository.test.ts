import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { createRefusingStorage } from '@/test/storage';
import { createLocalStorageTreeRepository } from './localStorageTreeRepository';

describe('localStorage tree repository', () => {
  it('has nothing to load before anything was saved', () => {
    expect(createLocalStorageTreeRepository(window.localStorage).load()).toBeNull();
  });

  it('loads the saved document after a page reload', () => {
    createLocalStorageTreeRepository(window.localStorage).save(sampleJson);

    const afterReload = createLocalStorageTreeRepository(window.localStorage);

    expect(afterReload.load()).toBe(sampleJson);
  });

  it('forgets the document once cleared', () => {
    const repository = createLocalStorageTreeRepository(window.localStorage);
    repository.save(sampleJson);

    repository.clear();

    expect(repository.load()).toBeNull();
  });

  it('reports a failed save and does not keep a stale document', () => {
    createLocalStorageTreeRepository(window.localStorage).save('{"name":"old"}');
    const repository = createLocalStorageTreeRepository(createRefusingStorage());

    const saved = repository.save(sampleJson);

    expect({ saved, loaded: repository.load() }).toEqual({ saved: false, loaded: null });
  });
});
