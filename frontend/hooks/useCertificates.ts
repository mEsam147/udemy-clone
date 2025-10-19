// hooks/useCertificates.ts
import { useMutation } from '@tanstack/react-query';
import { certificateService } from '@/services/certificate.service';

export const useDownloadCertificate = () => {
  return useMutation({
    mutationFn: ({ certificateId, filename }: { certificateId: string; filename?: string }) =>
      certificateService.downloadCertificate(certificateId, filename),
  });
};

// If you need other hooks, here they are:
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateService.getUserCertificates(),
  });
};

export const useCertificate = (courseId: string) => {
  return useQuery({
    queryKey: ['certificate', courseId],
    queryFn: () => certificateService.getCertificate(courseId),
    enabled: !!courseId,
  });
};

export const useVerifyCertificate = (verificationCode: string) => {
  return useQuery({
    queryKey: ['certificate-verify', verificationCode],
    queryFn: () => certificateService.verifyCertificate(verificationCode),
    enabled: !!verificationCode,
    retry: 1,
  });
};

export const useGenerateCertificatePDF = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificateId: string) =>
      certificateService.generateCertificatePDF(certificateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};