// Elementos
const modal = document.getElementById('noteModal');
const addNoteBtn = document.getElementById('addNoteBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const noteForm = document.getElementById('noteForm');
const fotosInput = document.getElementById('fotos');
const photoPreview = document.getElementById('photoPreview');
const notesFeed = document.getElementById('notesFeed');

let selectedFiles = [];

// Abrir modal
addNoteBtn.addEventListener('click', () => {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
});

// Fechar modal
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  noteForm.reset();
  selectedFiles = [];
  photoPreview.innerHTML = '';
}

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Lidar com preview de fotos
fotosInput.addEventListener('change', (e) => {
  selectedFiles = Array.from(e.target.files);
  updatePhotoPreview();
});

function updatePhotoPreview() {
  photoPreview.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'photo-preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="Foto ${index + 1}">
        <button type="button" class="remove-photo" onclick="removePhoto(${index})">×</button>
      `;
      photoPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removePhoto(index) {
  selectedFiles.splice(index, 1);
  updatePhotoPreview();
}

// Submeter formulário
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const materia = document.getElementById('materia').value;
  const data = document.getElementById('data').value;
  const conteudo = document.getElementById('conteudo').value;

  // Converter fotos para base64
  const fotosBase64 = [];
  for (let file of selectedFiles) {
    const base64 = await fileToBase64(file);
    fotosBase64.push(base64);
  }

  const noteData = {
    materia,
    data,
    conteudo,
    fotos: fotosBase64
  };

  try {
    const response = await fetch('/index.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(noteData)
    });

    if (response.ok) {
      alert('Nota salva com sucesso!');
      addNoteToFeed(noteData);
      closeModal();
    } else {
      alert('Erro ao salvar nota. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro de conexão. Tente novamente.');
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Adicionar nota ao feed
function addNoteToFeed(noteData) {
  // Remove empty state se existir
  const emptyState = notesFeed.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const noteCard = document.createElement('div');
  noteCard.className = 'note-card';

  // Formatar data
  const dateObj = new Date(noteData.data + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  let notesHTML = `
    <div class="note-header">
      <div class="note-title">${escapeHtml(noteData.materia)}</div>
      <div class="note-date">${formattedDate}</div>
    </div>
    <div class="note-content">${escapeHtml(noteData.conteudo)}</div>
  `;

  if (noteData.fotos && noteData.fotos.length > 0) {
    notesHTML += '<div class="note-photos">';
    noteData.fotos.forEach((photo, index) => {
      notesHTML += `
        <div class="note-photo">
          <img src="${photo}" alt="Foto ${index + 1}">
        </div>
      `;
    });
    notesHTML += '</div>';
  }

  noteCard.innerHTML = notesHTML;
  notesFeed.insertBefore(noteCard, notesFeed.firstChild);
}

// Escapar HTML para evitar XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Definir data mínima como hoje
document.addEventListener('DOMContentLoaded', () => {
  const dataInput = document.getElementById('data');
  const today = new Date().toISOString().split('T')[0];
  dataInput.min = today;
  dataInput.value = today;

  document.body.classList.add('dashboard-body');
  document.querySelector('header').classList.add('dashboard-header');
  
  loadNotesFromServer();
});

function loadNotesFromServer() {
  const notesFeed = document.getElementById('notesFeed');
  const notasFile = 'notas.json';
  
  fetch(notasFile)
    .then(response => response.json())
    .then(notas => {
      if (notas && notas.length > 0) {
        notesFeed.innerHTML = '';
        notas.forEach(nota => {
          addNoteToFeed(nota);
        });
      }
    })
    .catch(error => {
      console.log('Nenhuma nota salva ainda');
    });
}
