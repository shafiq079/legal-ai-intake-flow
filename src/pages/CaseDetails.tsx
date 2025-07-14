import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CaseDetails = () => {
  const { id } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await axios.get(`/api/cases/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setCaseDetails(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!caseDetails) {
    return <div>Case not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{caseDetails.title}</CardTitle>
              <p className="text-sm text-gray-500">Case Number: {caseDetails.caseNumber}</p>
            </div>
            <Badge variant={caseDetails.status === 'open' ? 'default' : 'secondary'}>
              {caseDetails.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p>{caseDetails.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Case Type</p>
                  <p>{caseDetails.caseType}</p>
                </div>
                <div>
                  <p className="font-semibold">Sub-Case Type</p>
                  <p>{caseDetails.subCaseType || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Priority</p>
                  <p>{caseDetails.priority}</p>
                </div>
                <div>
                  <p className="font-semibold">Created At</p>
                  <p>{new Date(caseDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Client & Lawyer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={caseDetails.clientId?.personalInfo?.avatar} />
                  <AvatarFallback>
                    {caseDetails.clientId?.personalInfo?.firstName?.charAt(0)}
                    {caseDetails.clientId?.personalInfo?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Client</p>
                  <p>{`${caseDetails.clientId?.personalInfo?.firstName} ${caseDetails.clientId?.personalInfo?.lastName}`}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    <p>{caseDetails.clientId?.contactInfo?.email}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    <p>{caseDetails.clientId?.contactInfo?.phone}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center mt-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={caseDetails.assignedLawyer?.profile?.avatar} />
                  <AvatarFallback>
                    {caseDetails.assignedLawyer?.profile?.firstName?.charAt(0)}
                    {caseDetails.assignedLawyer?.profile?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Assigned Lawyer</p>
                  <p>{`${caseDetails.assignedLawyer?.profile?.firstName} ${caseDetails.assignedLawyer?.profile?.lastName}`}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
