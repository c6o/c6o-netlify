import {
  Card,
  CardLoader,
  CardTitle,
  Form,
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

enum TokenState {
  NotSet = "not_set",
  Valid = "valid",
  Invalid = "invalid",
  Expired = "expired",
}

interface Space {
  id: string;
  name: string;
}
export const SiteConfiguration = () => {
  const sdk = useNetlifySDK();
  const { providerToken } = sdk.context.auth;

  const trpcUtils = trpc.useUtils();
  const [tokenState, setTokenState] = useState(TokenState.NotSet);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const siteSettingsQuery = trpc.siteSettings.read.useQuery();
  const siteSettingsMutation = trpc.siteSettings.update.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.read.invalidate();
    },
  });
  useEffect(() => {
    if (!providerToken) {
      setTokenState(TokenState.NotSet);
      return;
    }

    // Check if JWT is expired
    try {
      const payload = JSON.parse(atob(providerToken.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        setTokenState(TokenState.Expired);
        return;
      }
    } catch {
      setTokenState(TokenState.Invalid);
      return;
    }

    setTokenState(TokenState.Valid);
  }, [providerToken]);

  useEffect(() => {
    if (tokenState !== TokenState.Valid) {
      setOrgs([]);
      setSpaces([]);
      return;
    }

    const fetchOrgs = async () => {
      const orgsResponse = await fetch(
        `${hubURL}/api/admin/connect/hubadminapi.v1.HubAdminService/ListOrgs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        }
      );
      const orgData = await orgsResponse.json();
      setOrgs(orgData.orgs || []);
    };
    fetchOrgs();

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
  }, [tokenState]);

  if (siteSettingsQuery.isLoading) {
    return <CardLoader />;
  }

  if (tokenState !== TokenState.Valid) {
    return (
      <SiteConfigurationSurface>
        <ProviderAuthCard />
        <Card>
          <CardTitle>Configuration for {sdk.extension.name}</CardTitle>
          {tokenState === TokenState.NotSet && (
            <p>Please authenticate with Codezero above to configure this extension.</p>
          )}
          {tokenState === TokenState.Invalid && (
            <p>Your authentication token is invalid. Please re-authenticate above.</p>
          )}
          {tokenState === TokenState.Expired && (
            <p>
              Your authentication token has expired. Please re-authenticate above.
            </p>
          )}
        </Card>
      </SiteConfigurationSurface>
    );
  }
  return (
    <SiteConfigurationSurface>
      <ProviderAuthCard />
      <Card>
        <CardTitle>Configuration for {sdk.extension.name}</CardTitle>
        <p>Please select the connection target for this extension.</p>
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
          <Select
            label="Select Organization"
            name="orgID"
            options={orgs.map((org) => ({
              label: org.name,
              value: org.id,
            }))}
          />
          
          { siteSettingsQuery.data?.orgID && 
            <>
              <FormFieldSecret name="orgAPIKey" label="Organization API Key" />
              <Select
                label="Select Space"
                name="spaceID"
                options={spaces.map((space) => ({
                  label: space.name,
                  value: space.id,
                }))}
              />
            </>
          }

        </Form>
      </Card>
    </SiteConfigurationSurface>
  );
};
