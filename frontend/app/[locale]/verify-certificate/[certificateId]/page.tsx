import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { Certificate } from "@/lib/types"

// This would normally come from your API/Database
async function getCertificate(id: string): Promise<Certificate | null> {
  // Mock data for demonstration
  const certificate = {
    id,
    courseId: "1",
    userId: "1",
    course: {
      id: "1",
      title: "Complete JavaScript Course 2024",
      instructor: {
        id: "1",
        full_name: "John Doe",
        email: "john@example.com"
      }
    },
    user: {
      id: "1",
      full_name: "Jane Smith",
      email: "jane@example.com"
    },
    completionDate: new Date().toISOString(),
    isValid: true
  }

  return certificate
}

export default async function VerifyCertificatePage({
  params
}: {
  params: { certificateId: string }
}) {
  const certificate = await getCertificate(params.certificateId)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Certificate Verification</h1>
            {certificate.isValid ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Valid Certificate
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Invalid Certificate
              </Badge>
            )}
          </div>

          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Certificate Details</h2>
              <div className="grid gap-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="font-medium">{certificate.id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Course Information</h2>
              <div className="grid gap-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Course Title:</span>
                  <span className="font-medium">{certificate.course.title}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Instructor:</span>
                  <span className="font-medium">{certificate.course.instructor.full_name}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Student Information</h2>
              <div className="grid gap-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Student Name:</span>
                  <span className="font-medium">{certificate.user.full_name}</span>
                </div>
              </div>
            </div>

            {certificate.isValid && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  This certificate has been verified as authentic and was issued by Mini Udemy to the
                  student named above upon successful completion of the course.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
