import apiClient from './client';

export const treesApi = {
  analyze: async (imageFile: File, county: string = 'Nyeri'): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('county', county);

    const response = await apiClient.post('/api/v1/trees/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },
};