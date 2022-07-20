class NotesBookModel {
    constructor() {
        this.list = JSON.parse(localStorage.getItem('notes')) || [];
    }

    toLocalStorage() {
        localStorage.setItem('notes', JSON.stringify(this.list));
    }

    add(name, text) {
        const isName = this.list.findIndex(note => note.noteName === name);

        if (isName) {
            const note = {
                name,
                text,
                status: false,
            };

            this.list.push(note);
            this.toLocalStorage();
        }
    }

    remove(name) {
        const removeNote = this.list.findIndex(note => note.name === name);
        const removeCount = 1;

        this.list.splice(removeNote, removeCount);
        this.toLocalStorage();
    }

    edit(name, newText) {
        const EditNote = this.list.findIndex(note => note.name === name);
        this.list[EditNote].text = newText;
        this.toLocalStorage();
    }

    editStatus(name) {
        const editStatusNote = this.list.findIndex(note => note.name === name);
        this.list[editStatusNote].status = !this.list[editStatusNote].status;
        this.toLocalStorage();
    }

    statistic() {
        const allNotes = this.list.length;
        const addNote = 1;
        const initCompleted = 0;
        const completed = this.list.reduce((isCompleted, note) => {
            if (note.status) {
                // eslint-disable-next-line no-param-reassign
                isCompleted += addNote;
            }

            return isCompleted;
        }, initCompleted);

        const notCompleted = allNotes - completed;
        const statisticCount = {
            allNotes,
            completed,
            notCompleted,
        };

        return statisticCount;
    }
}

class NoteBookView {
    constructor(model) {
        this.model = model;
        this.form = document.querySelector('.add');
        this.ul =document.createElement('ul');
        this.ul.classList.add('list');
        this.stats = document.createElement('div');
        this.stats.classList.add('create-form');
        this.stats.classList.add('stats');
    }

    renderList() {
        this.ul.innerHTML = '';

        if(!this.model.list.length) return;

        const fragment = new DocumentFragment();

        for (const note of this.model.list) {
            const li = document.createElement('li');
            li.classList.add('create-form');

            const noteHeader = document.createElement('h2');
            noteHeader.textContent = 'NOTE';

            const addButton = document.createElement('div');
            addButton.classList.add('checkbox-check');

            const noteName = document.createElement('input');
            noteName.classList.add('text-input');
            noteName.setAttribute('readonly', 'readonly');
            noteName.setAttribute('name', 'noteName');
            noteName.value = note.name;

            const noteText = document.createElement('textarea');
            noteText.classList.add('noteTextStyle');
            noteText.setAttribute('readonly', 'readonly');
            noteText.setAttribute('name', 'noteText');
            noteText.value = note.text;

            const textBox = document.createElement('div');
            textBox.classList.add('text-box');

            const statusCheckbox = document.createElement('input');
            statusCheckbox.classList.add('status-checkbox');
            statusCheckbox.setAttribute('type', 'checkbox');
            if (note.status) {
                li.classList.add('checked');
                statusCheckbox.setAttribute('checked', 'checked');
            }

            const check = document.createElement('span');
            check.classList.add('check');
            check.textContent = 'Status';

            const removeButton = document.createElement('button');
            removeButton.classList.add('remove');

            const removeText = document.createElement('span');
            removeText.textContent = 'Remove';

            const removeButtonBox = document.createElement('div');
            removeButtonBox.classList.add('add-button');

            addButton.append(statusCheckbox, check);
            textBox.append(noteName, noteText);
            removeButton.append(removeText);
            removeButtonBox.append(removeButton);
            li.append(addButton, textBox, removeButton);
            fragment.append(li);
        }

        this.ul.append(fragment);
        this.form.after(this.ul);
    }

    renderStatistic() {
        this.stats.innerHTML = '';
        const script = document.querySelector('script');
        const notesLeft = document.createElement('span');
        const notesDone = document.createElement('span');
        const notesAll = document.createElement('span');
        const fragment = new DocumentFragment();

        notesLeft.classList.add('notes-left');
        notesDone.classList.add('notes-done');
        notesAll.classList.add('notes-all');

        const { allNotes, completed, notCompleted } = this.model.statistic();

        notesAll.textContent = `${allNotes} All notes`;
        notesDone.textContent = `${completed} Completed`;
        notesLeft.textContent = `${notCompleted} Not completed`;

        this.stats.append(notesLeft, notesDone, notesAll);
        fragment.append(this.stats);
        script.before(fragment);
    }

    initSubmit() {
        this.form.addEventListener('submit', e => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const noteName = formData.get('noteName').trim();
            const noteText = formData.get('noteText').trim();

            if (noteName && noteText) {
                this.model.add(noteName, noteText);
                this.renderList();
                this.renderStatistic();
                e.target.reset();
            }
        });
    }

    initRemove() {
        this.ul.addEventListener('click', e => {
            if (e.target.classList.contains('remove')) {
                const targetNoteName = e.target.getElementsByClassName('noteName');

                this.model.remove(targetNoteName);
                this.renderList();
                this.renderStatistic();
            }
        });
    }

    initEdit() {
        this.ul.addEventListener('dblclick', e => {
            if (e.target.name === 'noteText') {
                if (e.target.hasAttribute('readonly')) {
                    e.target.removeAttribute('readonly');
                } else {
                    e.target.setAttribute('readonly', 'readonly');
                }
            }
        });

        this.ul.addEventListener('change', e => {
            if (e.target.name === 'noteText') {
                const noteText = e.target.value;
                const noteName = e.target.previousSibling.value;

                if (e.target.hasAttribute('readonly')) {
                    e.target.removeAttribute('readonly');
                } else {
                    e.target.setAttribute('readonly', 'readonly');
                }

                this.model.edit(noteName, noteText);
            }
        });
    }

    initChangeStatus() {
        this.ul.addEventListener('click', e => {
            if (e.target.classList.contains('status-checkbox')) {
                const li = e.target.parentNode.parentNode;
                const textIndex = 1;
                const noteName = e.target.parentNode.parentNode.childNodes[textIndex].firstChild.value;

                if (li.classList.contains('checked')) {
                    li.classList.remove('checked');
                } else {
                    li.classList.add('checked');
                }

                this.model.editStatus(noteName);
                this.renderStatistic();
            }
        });
    }
}

const nb = new NoteBookView(new NotesBookModel());
nb.renderList();
nb.renderStatistic();
nb.initSubmit();
nb.initRemove();
nb.initEdit();
nb.initChangeStatus();