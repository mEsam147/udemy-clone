import CertificateView from "../../[verificationCode]/page";

export default function VerifyCertificatePage({params}:{params:{verificationCode:string}}) {
    return <>
    
    <CertificateView verificationCode={params.verificationCode} />
    </>
}