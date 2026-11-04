var CotaboxForm = (function () {
  var EMAIL_DOMAIN = '@cotabox.com.br';
  var EMAIL_LOCAL_PATTERN = /^[a-z0-9]+([._-][a-z0-9]+)*$/;
  var MESSAGES = {
    firstRequired: 'Informe o nome.',
    lastRequired: 'Informe o sobrenome.',
    phoneIncomplete: 'Informe o telefone completo, com DDD. Exemplo: (11) 91234-5678.',
    phoneArea: 'DDD inválido. Use um DDD entre 11 e 99.',
    phoneMobile: 'Celular deve começar com 9 depois do DDD.',
    email: 'Informe o usuário do e-mail, só com letras, números, ponto, hífen ou sublinhado. Exemplo: nome.sobrenome.',
  };
  var touched = {};

  function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatPhone(value) {
    var digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits.length ? '(' + digits : '';
    var area = digits.slice(0, 2);
    var rest = digits.slice(2);
    var split = digits.length > 10 ? 5 : 4;
    if (rest.length <= split) return '(' + area + ') ' + rest;
    return '(' + area + ') ' + rest.slice(0, split) + '-' + rest.slice(split);
  }

  function phoneError(value) {
    if (!onlyDigits(value)) return '';
    var digits = onlyDigits(value);
    if (digits.length < 10) return MESSAGES.phoneIncomplete;
    if (!/^[1-9][1-9]/.test(digits)) return MESSAGES.phoneArea;
    if (digits.length === 11 && digits.charAt(2) !== '9') return MESSAGES.phoneMobile;
    return '';
  }

  function emailLocal(value) {
    return String(value || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }

  function formatEmail(value) {
    return emailLocal(value) + EMAIL_DOMAIN;
  }

  function normalizeEmail(value) {
    var local = emailLocal(value);
    return local ? local + EMAIL_DOMAIN : '';
  }

  function emailError(value) {
    var local = emailLocal(value);
    if (!local) return '';
    return EMAIL_LOCAL_PATTERN.test(local) ? '' : MESSAGES.email;
  }

  function requiredError(message) {
    return function (value) {
      return String(value || '').trim() ? '' : message;
    };
  }

  var VALIDATORS = {
    first: requiredError(MESSAGES.firstRequired),
    last: requiredError(MESSAGES.lastRequired),
    phone: phoneError,
    email: emailError,
  };

  function caretAfterDigits(formatted, digitCount) {
    if (!digitCount) return 0;
    var seen = 0;
    for (var index = 0; index < formatted.length; index += 1) {
      if (/\d/.test(formatted.charAt(index))) seen += 1;
      if (seen === digitCount) return index + 1;
    }
    return formatted.length;
  }

  function bindPhoneMask(input) {
    input.addEventListener('input', function () {
      var digitsBeforeCaret = onlyDigits(input.value.slice(0, input.selectionStart)).length;
      input.value = formatPhone(input.value);
      var position = caretAfterDigits(input.value, digitsBeforeCaret);
      input.setSelectionRange(position, position);
    });
  }

  function keepCaretBeforeDomain(input) {
    if (input.selectionStart !== input.selectionEnd) return;
    var limit = emailLocal(input.value).length;
    if (input.selectionStart <= limit) return;
    input.setSelectionRange(limit, limit);
  }

  function bindEmailMask(input) {
    var ignoringDomain = false;

    input.addEventListener('beforeinput', function (event) {
      if (event.inputType && event.inputType.indexOf('delete') === 0) {
        ignoringDomain = false;
        return;
      }
      if (event.inputType !== 'insertText') return;
      if (event.data === '@') ignoringDomain = true;
      if (ignoringDomain) event.preventDefault();
    });
    input.addEventListener('focus', function () {
      ignoringDomain = false;
      if (!input.value) input.value = EMAIL_DOMAIN;
      keepCaretBeforeDomain(input);
    });
    input.addEventListener('click', function () {
      keepCaretBeforeDomain(input);
    });
    input.addEventListener('keyup', function () {
      keepCaretBeforeDomain(input);
    });
    input.addEventListener('input', function () {
      var caret = emailLocal(input.value.slice(0, input.selectionStart)).length;
      input.value = formatEmail(input.value);
      var position = Math.min(caret, emailLocal(input.value).length);
      input.setSelectionRange(position, position);
    });
    input.addEventListener('blur', function () {
      ignoringDomain = false;
      input.value = normalizeEmail(input.value);
    });
  }

  function showError(input, message) {
    var field = input.parentNode;
    var errorId = input.id + '-error';
    var error = document.getElementById(errorId);
    field.classList.toggle('form__field--invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (!message) {
      if (error) error.remove();
      input.removeAttribute('aria-describedby');
      return;
    }
    if (!error) {
      error = document.createElement('p');
      error.id = errorId;
      error.className = 'form__error';
      error.setAttribute('role', 'alert');
      field.appendChild(error);
    }
    error.textContent = message;
    input.setAttribute('aria-describedby', errorId);
  }

  function validateField(id) {
    var input = document.getElementById(id);
    if (!input) return '';
    touched[id] = true;
    var message = VALIDATORS[id](input.value);
    showError(input, message);
    return message;
  }

  function validateAll() {
    var firstInvalid = '';
    Object.keys(VALIDATORS).forEach(function (id) {
      if (validateField(id) && !firstInvalid) firstInvalid = id;
    });
    if (!firstInvalid) return true;
    document.getElementById(firstInvalid).focus();
    return false;
  }

  function bindValidation(id) {
    var input = document.getElementById(id);
    input.addEventListener('blur', function () {
      validateField(id);
    });
    input.addEventListener('input', function () {
      if (touched[id]) validateField(id);
    });
  }

  function init() {
    bindPhoneMask(document.getElementById('phone'));
    bindEmailMask(document.getElementById('email'));
    Object.keys(VALIDATORS).forEach(bindValidation);
  }

  return {
    init: init,
    validateAll: validateAll,
    formatPhone: formatPhone,
    normalizeEmail: normalizeEmail,
    phoneError: phoneError,
    emailError: emailError,
    emailLocal: emailLocal,
    formatEmail: formatEmail,
  };
}());

if (typeof module !== 'undefined') module.exports = CotaboxForm;
