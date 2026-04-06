const modal = document.getElementById('noteModal');
const addNoteBtn = document.getElementById('addNoteBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const noteForm = document.getElementById('noteForm');
const fotosInput = document.getElementById('fotos');
const photoPreview = document.getElementById('photoPreview');
const notesFeed = document.getElementById('notesFeed');
const viewModal = document.getElementById('viewNoteModal');
const closeViewBtn = document.querySelector('.close-view');

let selectedFiles = [];

addNoteBtn.addEventListener('click', () => {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  noteForm.reset();
  selectedFiles = [];
  photoPreview.innerHTML = '';
}

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

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

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const materia = document.getElementById('materia').value;
  const data = document.getElementById('data').value;
  const conteudo = document.getElementById('conteudo').value;

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

function addNoteToFeed(noteData) {
  const emptyState = notesFeed.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const noteCard = document.createElement('div');
  noteCard.className = 'note-card';

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
      <div style="display: flex; gap: 10px; align-items: center;">
        <div class="note-date">${formattedDate}</div>
        <button class="btn-delete" onclick="deletarNota(${noteData.id}, event)">Excluir</button>
      </div>
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
  noteCard.addEventListener('click', () => openViewModal(noteData));
  notesFeed.insertBefore(noteCard, notesFeed.firstChild);
}

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

function openViewModal(noteData) {
  document.getElementById('viewMateriaTitle').textContent = noteData.materia;
  
  const dateObj = new Date(noteData.data + 'T00:00:00');
  document.getElementById('viewDataDate').textContent = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  document.getElementById('viewConteudoText').textContent = noteData.conteudo;

  const fotosContainer = document.getElementById('viewFotosContainer');
  fotosContainer.innerHTML = '';
  
  if (noteData.fotos && noteData.fotos.length > 0) {
    noteData.fotos.forEach((photo) => {
      fotosContainer.innerHTML += `
        <div style="width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <img src="${photo}" style="width: 100%; height: auto; display: block;">
        </div>
      `;
    });
  }

  viewModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeViewModalFunc() {
  viewModal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

closeViewBtn.addEventListener('click', closeViewModalFunc);

window.addEventListener('click', (event) => {
  if (event.target === viewModal) {
    closeViewModalFunc();
  }
});

async function deletarNota(id, event) {
  event.stopPropagation(); 

  if (!confirm("Tem certeza que deseja excluir esta nota?")) {
    return;
  }

  try {
    const response = await fetch('/index.html', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id })
    });

    if (response.ok) {
      alert("Nota excluída com sucesso!");
      // Recarrega a página para atualizar o feed
      window.location.reload(); 
    } else {
      alert("Erro ao excluir a nota.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro de conexão ao tentar excluir.");
  }
}