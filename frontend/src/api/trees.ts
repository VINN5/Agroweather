import apiClient from './client';

export interface TreeAnalysis {
  total_tree_count?: number;
  tree_count?: number;
  canopy_coverage_pct?: number;
  canopy_cover?: number;
  confidence_score?: number;
  health_score?: number;
  tree_health?: {
    healthy: number;
    needs_care: number;
    needs_replacement: number;
  };
  recommendations?: string[];
  overlay_image_url?: string;
  original_image_url?: string;
}

export const treesApi = {
  analyze: async (imageFile: File): Promise<TreeAnalysis> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/api/v1/trees/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },
};