
const GIST_FILENAME = 'biomed_portal_data.json';

export async function syncToGitHub(token: string, data: any) {
  try {
    // 1. Get existing gist if it exists
    const gistsResponse = await fetch('https://api.github.com/gists', {
      headers: { Authorization: `token ${token}` }
    });
    const gists = await gistsResponse.json();
    const existingGist = gists.find((g: any) => g.description === 'BioMed Portal Cloud Data');

    const gistContent = {
      description: 'BioMed Portal Cloud Data',
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(data, null, 2)
        }
      }
    };

    if (existingGist) {
      // Update existing
      await fetch(`https://api.github.com/gists/${existingGist.id}`, {
        method: 'PATCH',
        headers: { Authorization: `token ${token}` },
        body: JSON.stringify(gistContent)
      });
    } else {
      // Create new
      await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: { Authorization: `token ${token}` },
        body: JSON.stringify(gistContent)
      });
    }
    return true;
  } catch (error) {
    console.error('GitHub Sync Error:', error);
    return false;
  }
}

export async function fetchFromGitHub(token: string) {
  try {
    const gistsResponse = await fetch('https://api.github.com/gists', {
      headers: { Authorization: `token ${token}` }
    });
    const gists = await gistsResponse.json();
    const existingGist = gists.find((g: any) => g.description === 'BioMed Portal Cloud Data');

    if (existingGist) {
      const gistDetailResponse = await fetch(existingGist.url, {
        headers: { Authorization: `token ${token}` }
      });
      const gistDetail = await gistDetailResponse.json();
      return JSON.parse(gistDetail.files[GIST_FILENAME].content);
    }
    return null;
  } catch (error) {
    console.error('GitHub Fetch Error:', error);
    return null;
  }
}
