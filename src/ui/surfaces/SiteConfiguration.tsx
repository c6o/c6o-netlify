import {
  Card,
  CardLoader,
  CardTitle,
  Form,
  FormField,
  FormFieldSecret,
  SiteConfigurationSurface,
  Select,
} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK } from "@netlify/sdk/ui/react";
import { trpc } from "../trpc";
import { SiteSettingsSchema } from "../../schema/team-configuration";
import { useState, useEffect, useRef } from "react";

const hubURL = 'https://staging.codezero.dev'

interface Space {
  id: string;
  name: string;
}
export const SiteConfiguration = () => {
  const sdk = useNetlifySDK();

  const trpcUtils = trpc.useUtils();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const siteSettingsQuery = trpc.siteSettings.read.useQuery();
  const siteSettingsMutation = trpc.siteSettings.update.useMutation({
    onSuccess: async (data) => {
      console.log('Mutation succeeded with data:', data);
      await trpcUtils.siteSettings.read.invalidate();
    },
  });

  const fetchSpaces = async (orgID: string, orgAPIKey: string) => {
      console.log('Fetching spaces...');
      const spacesResponse = await fetch(`${hubURL}/api/c6o/connect/c6oapi.v1.C6OService/ListSpaces`, {
        method: 'POST',
        headers: {
          'Authorization': `${orgID}:${orgAPIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const spaceData = await spacesResponse.json();
      console.log('NSX', spaceData)
      setSpaces(spaceData.spaces || []);
  }

  if (siteSettingsQuery.isLoading) {
    return <CardLoader />;
  }

  return (
    <SiteConfigurationSurface>
      <Card>
        <CardTitle>Configuration for {sdk.extension.name}</CardTitle>
        <p></p>
        <Form
          defaultValues={{
            ...siteSettingsQuery.data ?? {
              orgID: undefined, 
              orgAPIKey: undefined, 
              spaceID : undefined,
            },
          }}
          schema={SiteSettingsSchema}
          onSubmit={siteSettingsMutation.mutateAsync}
        >
          {({ context: { watch } }) => {
            const orgID = watch('orgID')
            const orgAPIKey = watch('orgAPIKey')
            const spaceID = watch('spaceID')

            const prevValues = useRef<{
              orgID: string
              orgAPIKey: string
              spaceID: string
            } | null>(null)

            useEffect(() => {
              // Initialize prevValues only once, after the query is loaded
              if (!prevValues.current && siteSettingsQuery.data) {
                prevValues.current = {
                  ...siteSettingsQuery.data
                };

                if (prevValues.current.orgID && prevValues.current.orgAPIKey)
                  fetchSpaces(orgID, orgAPIKey)
              }
            }, [siteSettingsQuery.data]);

            useEffect(() => {
              if (prevValues.current?.orgID !== orgID || 
                  prevValues.current?.orgAPIKey !== orgAPIKey) {
                fetchSpaces(orgID, orgAPIKey)
              }
              prevValues.current = {orgID, orgAPIKey, spaceID }
            }, [orgID, orgAPIKey, spaceID]);

            return (
              <>
                <p>You can obtain the Organization ID and API Key from the API Keys menu in the <a href={hubURL} target="_blank">Codezero Hub</a></p>
                <FormField
                  name="orgID"
                  type="text"
                  label="Organization ID"
                />
                <FormFieldSecret
                  name="orgAPIKey"
                  label="Organization API Key"
                />

                {spaces.length > 0 && (
                  <Select
                    label="Select Space"
                    name="spaceID"
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
    </SiteConfigurationSurface>
  );
};
