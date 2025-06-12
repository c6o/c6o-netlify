import {
  Card,
  CardLoader,
  CardTitle,
  Form,
  FormField,
  FormFieldSecret,
  SiteConfigurationSurface,
  Select,
  ProviderAuthCard,
} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK } from "@netlify/sdk/ui/react";
import { hubURL } from "../../server/hub";
import { trpc } from "../trpc";
import { SiteSettingsSchema } from "../../schema/team-configuration";
import { useState, useEffect } from "react";

interface Space {
  id: string;
  name: string;
}
export const SiteConfiguration = () => {
  const sdk = useNetlifySDK();
  const { providerToken } = sdk.context.auth;

  const trpcUtils = trpc.useUtils();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const siteSettingsQuery = trpc.siteSettings.read.useQuery();
  const siteSettingsMutation = trpc.siteSettings.update.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.read.invalidate();
    },
  });

  useEffect(() => {
    if (!providerToken) {
      setSpaces([]);
      return;
    }

    const fetchSpaces = async () => {
      const spacesResponse = await fetch(
        `${hubURL}/api/admin/connect/hubadminapi.v1.HubAdminService/ListTeamspaces`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        }
      );
      const spaceData = await spacesResponse.json();
      setSpaces(spaceData.spaces || []);
    };
    fetchSpaces();
  }, [providerToken]);

  if (siteSettingsQuery.isLoading) {
    return <CardLoader />;
  }

  return (
    <SiteConfigurationSurface>
      <ProviderAuthCard />
      <Card>
        <CardTitle>Configuration for {sdk.extension.name}</CardTitle>
        <p></p>
        <Form
          defaultValues={{
            ...(siteSettingsQuery.data ?? {
              orgID: undefined,
              orgAPIKey: undefined,
              spaceID: undefined,
            }),
          }}
          schema={SiteSettingsSchema}
          onSubmit={siteSettingsMutation.mutateAsync}
        >
          <p>
            You can obtain the Organization ID and API Key from the API Keys
            menu in the{" "}
            <a href={hubURL} target="_blank">
              Codezero Hub
            </a>
          </p>
          <FormField name="orgID" type="text" label="Organization ID" />
          <FormFieldSecret name="orgAPIKey" label="Organization API Key" />

          {spaces.length > 0 && (
            <Select
              label="Select Space"
              name="spaceID"
              options={spaces.map((space) => ({
                label: space.name,
                value: space.id,
              }))}
            />
          )}
        </Form>
      </Card>
    </SiteConfigurationSurface>
  );
};
