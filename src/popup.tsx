import React from 'react';
import './style.css';
import axios from 'axios';

function IndexPopup() {
  const handleScrape = async () => {
    console.log("handleScrape called");

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];

      if (activeTab.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: getHighlightedText
        });

        if (chrome.runtime.lastError) {
          console.error("Error executing script:", chrome.runtime.lastError.message);
          return;
        }

        if (results && results[0] && results[0].result) {
          const highlightedText = results[0].result;

          // Verify if the data is present on the website
          await verifyData(highlightedText);
        } else {
          alert("No text highlighted.");
        }
      }
    } catch (error) {
      console.error('Error getting active tab:', error);
    }
  };

  async function getHighlightedText() {
    return window.getSelection().toString();
  }

  async function verifyData(data) {
    try {
      let endpoint;

      // Checking the type of data and construct the API endpoint accordingly
      if (data.startsWith("did:3")) {
        endpoint = `https://api.disco.xyz/v1/profile/${data}`;
      } else if (/^0x[a-fA-F0-9]{40}$/.test(data)) {
        // Check if data is a valid Ethereum address
        endpoint = `https://api.disco.xyz/v1/profile/address/${data}`;
      } else if (typeof data === 'string') {
        //CHeck if it a profile name
        endpoint = 'https://api.disco.xyz/v1/search/?handle=provenauthority';
      } else {
        alert("Invalid data type.");
        return;
      }
  
      // Make an HTTP request to the constructed endpoint
      const response = await axios.get(endpoint, {
        headers: {
          "Authorization": "Bearer 49915397-7ad4-413a-94f2-856552f0826f"
        }
      });

      const result = response.data;

      //Making a presentable form of the result
      const listedResult = `DID: ${result.did}\nIs Disco Org: ${result.isDiscoOrg}\nBio: ${result.profile.bio}\nAvatar: ${result.profile.avatar}\nLinkages: \n${result.profile.linkages.map((linkage, index) => {
        return `Linkage ${index + 1}:\n DID: ${linkage.did}\n Type: ${linkage.type}\n    Handle: ${linkage.handle}`;
      }).join('\n')}`;

      // Check if the result contains the data
      if (result) {
        alert(`'${data}' profile is verified by disco.xyz.\n\n Verification Credentials:\n'${listedResult}'\n\n visit disco.xyz for  more information`);
      } else {
        alert(`'${data}' profile is not verified by disco.xyz.\n\n visit disco.xyz for  more information`);
      }
    } catch (error) {
      console.error('Error verifying data:', error);
      alert(`'${data}' profile is not verified by disco.xyz.\n\n visit disco.xyz for  more information`); // Display an informative alert
    }
  }

  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-16 plasmo-w-40">
      <button 
        onClick={handleScrape}
        type="button"
        className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-px-4 plasmo-py-2 plasmo-text-sm plasmo-rounded-lg plasmo-transition-all plasmo-border-none plasmo-shadow-lg hover:plasmo-shadow-md active:plasmo-scale-105 plasmo-bg-slate-50 hover:plasmo-bg-slate-100 plasmo-text-slate-800 hover:plasmo-text-slate-900"
      >
        Verify Highlighted Profile
      </button>
    </div>
  );
}

export default IndexPopup;
