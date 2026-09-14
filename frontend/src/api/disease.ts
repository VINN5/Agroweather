import apiClient from './client';

export const diseaseApi = {
  analyze: async (
    imageFile: File,
    cropType: string = '',
    county: string = 'Nyeri',
    notes: string = ''
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (cropType) formData.append('crop_type', cropType);
    formData.append('county', county);
    if (notes) formData.append('notes', notes);

    const response = await apiClient.post('/api/v1/disease/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    return response;
  },
};
