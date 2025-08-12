const API_BASE_URL = 'http://localhost:5000/api';

export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentResponse {
  success: boolean;
  data?: Department[];
  message?: string;
  error?: string;
}

export interface SingleDepartmentResponse {
  success: boolean;
  data?: Department;
  message?: string;
  error?: string;
}

// Get all departments
export const getAllDepartments = async (): Promise<DepartmentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/department`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    return {
      success: false,
      error: 'Failed to fetch departments'
    };
  }
};

// Add new department
export const addDepartment = async (department: { name: string; description?: string }): Promise<SingleDepartmentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/department`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding department:', error);
    return {
      success: false,
      error: 'Failed to add department'
    };
  }
};

// Update department
export const updateDepartment = async (id: number, department: { name: string; description?: string }): Promise<SingleDepartmentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/department/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating department:', error);
    return {
      success: false,
      error: 'Failed to update department'
    };
  }
};

// Delete department
export const deleteDepartment = async (id: number): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/department/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting department:', error);
    return {
      success: false,
      error: 'Failed to delete department'
    };
  }
}; 