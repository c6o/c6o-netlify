/*
  export const fetchOrganizations = async (token: string) => {
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

  export const handleOrgChange = async (token:string, orgId: string) => {
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

  export const fetchSpaces = async (token: string) => {
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
  
  export const handleSpaceChange = async (token: string, spaceId: string) => {
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
*/
