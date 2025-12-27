// Debug mode: true when extension is loaded unpacked (developer mode)
const DEBUG = !('update_url' in chrome.runtime.getManifest());

function debugLog(...args) {
  if (DEBUG) {
    console.log('[POE2 Save Filter]', ...args);
  }
}

debugLog('Extension loaded (DEBUG MODE)');

// Constantes
const SEARCH_URL_REGEX = /\/trade2\/search\/poe2\/[^\/]+\/(.+)/;
const CHECK_INTERVAL = 300;

// Estado
let currentUrl = '';

// Criar o botão Save Filter
function createSaveButton() {
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Filter';
  saveButton.id = 'save-filter-btn';
  saveButton.style.backgroundColor = '#357938';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.cursor = 'pointer';
  saveButton.style.marginLeft = '10px';
  saveButton.style.fontSize = '13px';

  saveButton.addEventListener('mouseenter', () => {
    saveButton.style.backgroundColor = '#329b37';
  });

  saveButton.addEventListener('mouseleave', () => {
    saveButton.style.backgroundColor = '#357938';
  });

  saveButton.addEventListener('click', () => {
    const urlPathForSave = window.location.href;
    const urlId = Date.now();

    chrome.storage.sync.get(['savedUrls'], (data) => {
      const savedUrls = data.savedUrls || [];
      savedUrls.push({ id: urlId, url: urlPathForSave });

      chrome.storage.sync.set({ savedUrls: savedUrls }, () => {
        debugLog('Filter saved:', urlPathForSave);
      });
      alert('Filter saved. Click on the extension to view the filter.');
    });
  });

  return saveButton;
}

// Verificar se o container está pronto (tem botões do site)
function isContainerReady() {
  const controlsCenter = document.querySelector('.controls-center');
  if (!controlsCenter) return false;

  // Verifica se tem pelo menos um botão (indica que o DOM está estável)
  return controlsCenter.querySelectorAll('button').length > 0;
}

// Injetar o botão no container
function injectButton() {
  if (!isContainerReady()) {
    debugLog('Container not ready yet');
    return false;
  }

  const controlsCenter = document.querySelector('.controls-center');

  if (controlsCenter.querySelector('#save-filter-btn')) {
    debugLog('Button already exists');
    return true;
  }

  const saveButton = createSaveButton();
  controlsCenter.appendChild(saveButton);
  debugLog('Button injected successfully');
  return true;
}

// Remover o botão
function removeButton() {
  const btn = document.getElementById('save-filter-btn');
  if (btn) {
    btn.remove();
    debugLog('Button removed');
  }
}

// Verificar se a URL é de uma busca válida
function isSearchUrl(url) {
  return SEARCH_URL_REGEX.test(url);
}

// Loop principal - verifica URL continuamente
setInterval(() => {
  const url = window.location.href;

  // URL mudou
  if (url !== currentUrl) {
    debugLog('URL changed:', url);
    currentUrl = url;

    if (isSearchUrl(url)) {
      debugLog('Valid search URL detected');
      injectButton();
    } else {
      debugLog('Not a search URL, removing button');
      removeButton();
    }
  }

  // Garantir que botão existe se URL é válida (caso DOM tenha sido recriado)
  if (isSearchUrl(url)) {
    const controlsCenter = document.querySelector('.controls-center');
    const buttonInContainer = controlsCenter?.querySelector('#save-filter-btn');

    if (!buttonInContainer) {
      debugLog('Button missing from container, re-injecting...');
      injectButton();
    }
  }
}, CHECK_INTERVAL);

// Listener para o botão Clear
document.addEventListener('click', (e) => {
  if (e.target.closest('.clear-btn')) {
    debugLog('Clear button clicked');
    removeButton();
  }
});

debugLog('Script initialized, monitoring URL changes...');
