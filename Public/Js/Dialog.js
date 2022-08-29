var dialogData = {
	
	'button_resume': {
		
		DialogType: 'confirm',
		
		TrueButtonText: 'ДА',
				
		FalseButtonText: 'НЕТ',
				
		QuestionText: 'Анкета заполнена и готова к отправке.<p>Хотите изменить анкету?</p>'
		
	},
	
	'NotRecordPermission': {
		
		DialogType: 'confirm',
		
		TrueButtonText: '',
				
		FalseButtonText: '',
		
		ExtButtonText: 'Получить разрешение',
				
		QuestionText: 'В данном проекте, требуется запись разговора с респондентом.<p><b>Для этого нужно дать разрешение на запись аудио.</b> Разрешите доступ к микрофону в адресной строке и нажмите Получить разрешение.</p><p>В случае записи на другом устройстве, файл записи нужно будет прислать отдельно.</p><p><b>Без файла записи анкета будет считаться недействительной.</b></p>'
		
	},
	
	'authError': {
		
		DialogType: 'confirm',
		
		TrueButtonText: '',
				
		FalseButtonText: '',
				
		QuestionText: 'Не заполнены данные для авторизации'
		
	},
	
	'LoginError': {
		
		DialogType: 'confirm',
		
		TrueButtonText: '',
				
		FalseButtonText: '',
				
		QuestionText: 'Запрос на вход отклонён'
		
	},
	
	'NotSend': {
		
		DialogType: 'confirm',
		
		TrueButtonText: '',
				
		FalseButtonText: '',
				
		QuestionText: 'Что-то пошло не так. Повторите отправку позже.'
		
	},
	
	'NotInternet': {
		
		DialogType: 'confirm',
		
		TrueButtonText: '',
				
		FalseButtonText: '',
				
		QuestionText: 'Похоже нет интернета. Проверьте и попробуйте ещё раз.'
		
	},
	
	'SinglePrompt': {
		
		DialogType: 'prompt',
		
		TrueButtonText: 'Записать',
				
		FalseButtonText: 'Отмена',
				
		TitleText: 'Впишите ответ'
		
	}
	
}

class ConfirmDialog {

	constructor({

		TitleText,
	
		QuestionText, 
		
		TrueButtonText, 
		
		FalseButtonText, 
		
		ExtButtonText, 
		
		Parent,
		
		DialogType
		
	}) {
		
		this.DialogType = DialogType || '';
		
		this.TitleText = TitleText || '';
	  
		this.QuestionText = QuestionText || '';
		
		this.TrueButtonText = TrueButtonText || 'ОК';
		
		this.FalseButtonText = FalseButtonText || '';
		
		this.ExtButtonText = ExtButtonText || '';
		
		this.Parent = Parent || document.body;

		this.Dialog = undefined;
		
		this.TrueButton = undefined;
		
		this.FalseButton = undefined;

		if (this.DialogType == 'confirm') this._createConfirmDialog();
		
		if (this.DialogType == 'prompt') this._createPromptDialog();
		
		this._appendDialog();
	
	}

	confirm() {
	  
		return new Promise((resolve, reject) => {
			
			const somethingWentWrongUponCreation = ! this.Dialog || ! this.TrueButton || ! this.FalseButton;
		  
			if (somethingWentWrongUponCreation) {
			  
				reject('Someting went wrong when creating the modal');
			
				return;
			
			}

			this.Dialog.showModal();

			this.TrueButton.addEventListener("click", () => {
			  
				resolve(this.promptInput || true);
			
				this._destroy();
			
			});

			this.FalseButton.addEventListener("click", () => {
			  
				resolve(false);
			
				this._destroy();
			
			});
			
			this.extButton.addEventListener("click", () => {
			  
				resolve('ext');
			
				this._destroy();
			
			});
		  
		});
	
	}

	_createConfirmDialog() {
	  
		this.Dialog = elem('Dialog', {classname: 'confirm-dialog'});

		this.question = elem('div', {classname: 'confirm-dialog-question', innerhtml: this.QuestionText});
		
		this.Dialog.appendChild(this.question);

		const buttonGroup = elem('div', {classname: 'confirm-dialog-button-group'});
		
		this.Dialog.appendChild(buttonGroup);
		
		this.extButton = elem('button', {classname: 'confirm-dialog-button confirm-dialog-button--ext', type: 'button', textcontent: this.ExtButtonText});
		
		buttonGroup.appendChild(this.extButton);
		
		this.divider1 = elem('span', {classname: 'dialog-divider'});
		
		buttonGroup.appendChild(this.divider1);

		this.FalseButton = elem('button', {classname: 'confirm-dialog-button confirm-dialog-button--false', type: 'button', textcontent: this.FalseButtonText});
		
		buttonGroup.appendChild(this.FalseButton);
		
		this.divider2 = elem('span', {classname: 'dialog-divider'});
		
		buttonGroup.appendChild(this.divider2);
		
		this.TrueButton = elem('button', {classname: 'confirm-dialog-button confirm-dialog-button--true', type: 'button', textcontent: this.TrueButtonText});
		
		buttonGroup.appendChild(this.TrueButton);

	}
	
	_createPromptDialog() {
	  
		this.Dialog = elem('Dialog', {classname: 'prompt-dialog'});

		this.title = elem('div', {classname: 'prompt-dialog-question', innerhtml: this.TitleText});
		
		this.Dialog.appendChild(this.title);
		
		this.promptInput = elem('textarea', {classname: 'prompt-dialog-textarea'});
		
		this.Dialog.appendChild(this.promptInput);

		const buttonGroup = elem('div', {classname: 'prompt-dialog-button-group'});
		
		this.Dialog.appendChild(buttonGroup);
		
		this.extButton = elem('button', {classname: 'prompt-dialog-button prompt-dialog-button--ext', type: 'button', textcontent: this.ExtButtonText});
		
		buttonGroup.appendChild(this.extButton);
		
		this.divider1 = elem('span', {classname: 'dialog-divider'});
		
		buttonGroup.appendChild(this.divider1);

		this.FalseButton = elem('button', {classname: 'prompt-dialog-button prompt-dialog-button--false', type: 'button', textcontent: this.FalseButtonText});
		
		buttonGroup.appendChild(this.FalseButton);
		
		this.divider2 = elem('span', {classname: 'dialog-divider'});
		
		buttonGroup.appendChild(this.divider2);
		
		this.TrueButton = elem('button', {classname: 'prompt-dialog-button prompt-dialog-button--true', type: 'button', textcontent: this.TrueButtonText});
		
		buttonGroup.appendChild(this.TrueButton);
		
		this.promptInput.focus();

	}

	_appendDialog() {
		  
		this.Parent.appendChild(this.Dialog);
		
	}

	_destroy() {
	  
		this.Parent.removeChild(this.Dialog);
		
		delete this;
	
	}
  
}

async function al(e, type = false, index = false) {
	
	let id = typeof(e.target) != 'undefined' ? e.target.id : e;
	
	switch (id) {
		
		case 'NotRecordPermission':
		
			const NotRecordPermissionDialog = new ConfirmDialog(dialogData[id]);
			
			const RecordPermission = await NotRecordPermissionDialog.confirm();
			
			if (RecordPermission === 'ext') {
				
				getRecordPerm();
				
			}
		
		break;
		
		case 'NotInternet':
		
			const dialog1 = new ConfirmDialog(dialogData[id]);
			
			await dialog1.confirm();
		
		break;
		
		case 'LoginError':
		
			const dialog3 = new ConfirmDialog(dialogData[id]);
			
			await dialog3.confirm();
		
		break;
		
		case 'Reject_error':
		
			const dialog6 = new ConfirmDialog(dialogData[id]);
			
			await dialog6.confirm();
		
		break;
		
		case 'authError':
		
			const dialog5 = new ConfirmDialog(dialogData[id]);
			
			await dialog5.confirm();
		
		break;
		
		case 'button_resume':
		
			const dialog4 = new ConfirmDialog(dialogData[id]);
			
			const canResume = await dialog4.confirm();
			
			if (canResume) {
				
				LA = e.target.dataset.an;
				
				if (/4|5/.test(AN[LP][LA].condition)) {
				
					LI = AN[LP][LA].sti;
						
					LV = AN[LP][LA].lv1;
						
					EVG = AN[LP][LA].evg;
					
					L.next(LI);
						
					wm(1, false);
						
					if (RL[LP].hasOwnProperty(LV) && RL[LP][LV][0].activity == 'vis') rule(LV);
						
				}
				
			}
		
		break;
		
		case 'SinglePrompt':
		
			const dialog7 = new ConfirmDialog(dialogData[id]);
			
			PROMPTRESULT = await dialog7.confirm();
		
		break;
		
	}
	
}

