import axiosInstance from '../../../services/axiosInstance';

export const equipmentAPI = {
  async lookupSerial(serialNumber) {
    const response = await axiosInstance.get(`/v1/serials/${serialNumber}`);
    return response.data?.data || response.data;
  },

  async verifyHardwareSerial(jobId, equipmentId, serialNumber) {
    try {
      const response = await axiosInstance.get(`/v1/serials/${serialNumber}`);
      const serialData = response.data?.data || response.data;
      return {
        success: true,
        equipmentId,
        serialNumber,
        status: serialData?.status || 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        serialData,
      };
    } catch (err) {
      // Re-throw with descriptive error message from backend
      const message = err.response?.data?.message || `Equipment serial ${serialNumber} not found in warehouse inventory`;
      throw new Error(message);
    }
  },
};

export default equipmentAPI;
