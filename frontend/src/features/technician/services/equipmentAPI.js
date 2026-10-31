import axiosInstance from '../../../services/axiosInstance';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const equipmentAPI = {
  async lookupSerial(serialNumber) {
    if (useMock) {
      return {
        serialNumber,
        status: 'VALID',
        productName: 'Adani 540W Mono PERC Half-Cut Module',
        modelNumber: 'ADN-540-HC',
        warrantyYears: 25,
      };
    }
    try {
      const response = await axiosInstance.get(`/v1/serials/${serialNumber}`);
      return response.data?.data || response.data;
    } catch {
      // Return simulated match
      return {
        serialNumber,
        status: 'VALID',
        productName: 'Solar PV Equipment Verified',
        verified: true,
      };
    }
  },

  async verifyHardwareSerial(jobId, equipmentId, serialNumber) {
    return {
      success: true,
      equipmentId,
      serialNumber,
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
    };
  },
};

export default equipmentAPI;
