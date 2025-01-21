import {
  Button,
  Card,
  CardLoader,
  CardTitle,
  Form,
  FormField,
  FormFieldSecret,
  TeamConfigurationSurface,
  Select,
} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK } from "@netlify/sdk/ui/react";
import { trpc } from "../trpc";
import { teamSettingsSchema } from "../../schema/team-configuration";
import logoImg from "../../assets/netlify-logo.png";
import { useState, useEffect } from "react";

interface Organization {
  id: string;
  name: string;
}

interface Space {
  id: string;
  name: string;
}

export const TeamConfiguration = () => {
  const sdk = useNetlifySDK();
  const trpcUtils = trpc.useUtils();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const teamSettingsQuery = trpc.teamSettings.query.useQuery();
  const teamSettingsMutation = trpc.teamSettings.mutate.useMutation({
    onSuccess: async (data) => {
      console.log('Mutation succeeded with data:', data);
      await trpcUtils.teamSettings.query.invalidate();
    },
  });

  const fetchOrganizations = async () => {
    const form = document.querySelector('form');
    const formData = new FormData(form as HTMLFormElement);
    const token = formData.get('userTokenSecret') as string;
    try {
      const response = await fetch('https://hub.codezero.io/api/connect/hubapi.v1.APIService/ListOrgs', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      setOrganizations(data.orgs || []);
      setSpaces([]); // Clear spaces when orgs are refreshed
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const handleOrgChange = async (orgId: string) => {
    const form = document.querySelector('form');
    const formData = new FormData(form as HTMLFormElement);
    const token = formData.get('userTokenSecret') as string;

    console.log('Token:', token);
    console.log('OrgId:', orgId);

    if (!token || !orgId) {
      console.log('Missing token or orgId');
      return;
    }

    try {
      console.log('Setting org...');
      // First set the org
      const setOrgResponse = await fetch('https://hub.codezero.io/api/connect/hubapi.v1.APIService/SetOrg', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ org_id: orgId }),
      });
      console.log('SetOrg response:', await setOrgResponse.json());

      // Then fetch spaces
      console.log('Fetching spaces...');
      const spacesResponse = await fetch('https://hub.codezero.io/api/connect/hubapi.v1.APIService/ListSpaces', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const spacesData = await spacesResponse.json();
      console.log('Spaces data:', spacesData);
      setSpaces(spacesData.spaces || []);
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  };

  if (teamSettingsQuery.isLoading) {
    return <CardLoader />;
  }

  return (
    <TeamConfigurationSurface>
      <Card>
        <img src={logoImg} />
        <CardTitle>Example Section for {sdk.extension.name}</CardTitle>
        <Form
          defaultValues={{
            ...teamSettingsQuery.data ?? {
              userTokenSecret: "",
              exampleString: "",
              exampleSecret: "",
              exampleBoolean: false,
              exampleNumber: 123,
              selectedOrgId: "",
              selectedSpaceId: "",
            },
          }}
          schema={teamSettingsSchema}
          onSubmit={teamSettingsMutation.mutateAsync}
        >
          {({ context: { watch } }) => {
            const selectedOrgId = watch("selectedOrgId");

            useEffect(() => {
              if (selectedOrgId) {
                handleOrgChange(selectedOrgId);
              }
            }, [selectedOrgId]);

            return (
              <>
                <FormFieldSecret
                  name="userTokenSecret"
                  label="User Token"
                  helpText="You can obtain this from Your Profile in the Codezero hub"
                />
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    fetchOrganizations();
                  }}
                >
                  Refresh Organizations
                </Button>
                
                {organizations.length > 0 && (
                  <Select
                    label="Select Organization"
                    name="selectedOrgId"
                    options={organizations.map(org => ({
                      label: org.name,
                      value: org.id
                    }))}
                  />
                )}

                {spaces.length > 0 && (
                  <Select
                    label="Select Space"
                    name="selectedSpaceId"
                    options={spaces.map(space => ({
                      label: space.name,
                      value: space.id
                    }))}
                  />
                )}

                <FormField
                  name="exampleString"
                  type="text"
                  label="Example String"
                  helpText="This is an example string"
                />
                <FormField
                  name="exampleNumber"
                  type="number"
                  label="Example Number"
                  helpText="This is an example number"
                />
              </>
            );
          }}
        </Form>
      </Card>
    </TeamConfigurationSurface>
  );
};
