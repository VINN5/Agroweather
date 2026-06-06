import apiClient from './client';

export const treesApi = {
  analyze: async (imageFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/api/v1/trees/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  },
};