import {
  Card,
  CardLoader,
  CardTitle,
  Form,
  FormFieldSecret,
  TeamConfigurationSurface,
  Select,
} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK } from "@netlify/sdk/ui/react";
import { trpc } from "../trpc";
import { teamSettingsSchema } from "../../schema/team-configuration";
import { useState, useEffect, useRef } from "react";

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

  const fetchOrganizations = async (token: string) => {
    if (!token) {
      console.log('Missing token')
      return
    }
    
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

  const handleOrgChange = async (token:string, orgId: string) => {
    if (!token || !orgId) {
      console.log('Missing token or orgId');
      return;
    }

    try {
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
      await fetchSpaces(token);
      
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  };

  const fetchSpaces = async (token: string) => {
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
      setSpaces(spacesData.spaces || []);
  }
  
  const handleSpaceChange = async (token: string, spaceId: string) => {
    if (!token || !spaceId) {
      console.log('Missing token or spaceId');
      return;
    }

    try {
      const setSpaceResponse = await fetch('https://hub.codezero.io/api/connect/hubapi.v1.APIService/SetSpace', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ space_id: spaceId }),
      });
      console.log('SetSpace response:', await setSpaceResponse.json());
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  }

  if (teamSettingsQuery.isLoading) {
    return <CardLoader />;
  }

  return (
    <TeamConfigurationSurface>
      <Card>
        <CardTitle>Configuration for {sdk.extension.name}</CardTitle>
        <Form
          defaultValues={{
            ...teamSettingsQuery.data ?? {
              userTokenSecret: "",
              selectedOrgId: "",
              selectedSpaceId: "",
            },
          }}
          schema={teamSettingsSchema}
          onSubmit={teamSettingsMutation.mutateAsync}
        >
          {({ context: { watch, setValue } }) => {
            const userTokenSecret = watch("userTokenSecret");
            const selectedOrgId = watch("selectedOrgId");
            const selectedSpaceId = watch("selectedSpaceId");

            const prevValues = useRef<{
              userTokenSecret: string;
              selectedOrgId: string;
              selectedSpaceId: string;
            } | null>(null);

            useEffect(() => {
              // Initialize prevValues only once, after the query is loaded
              if (!prevValues.current && teamSettingsQuery.data) {
                prevValues.current = {
                  ...teamSettingsQuery.data
                };

                // The initial load
                if (prevValues.current.userTokenSecret)
                  fetchOrganizations(userTokenSecret)
                if (prevValues.current.userTokenSecret && prevValues.current.selectedOrgId)
                  fetchSpaces(userTokenSecret)

              }
            }, [teamSettingsQuery.data]);

            useEffect(() => {
              if (selectedOrgId && prevValues.current?.selectedOrgId !== selectedOrgId) {
                handleOrgChange(userTokenSecret, selectedOrgId);
                setValue("selectedSpaceId", "");
              }

              if (selectedSpaceId && prevValues.current?.selectedSpaceId !== selectedSpaceId) {
                handleSpaceChange(userTokenSecret, selectedSpaceId);
              }

              if (userTokenSecret && prevValues.current?.userTokenSecret !== userTokenSecret) {
                fetchOrganizations(userTokenSecret);
              }

              prevValues.current = { userTokenSecret, selectedOrgId, selectedSpaceId };

            }, [userTokenSecret, selectedOrgId, selectedSpaceId]);

            return (
              <>
                <FormFieldSecret
                  name="userTokenSecret"
                  label="User Token"
                  helpText="You can obtain this from Your Profile in the Codezero hub"
                />
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
              </>
            );
          }}
        </Form>
      </Card>
    </TeamConfigurationSurface>
  );
};
