(function () {
    var display = document.getElementById('display');
    var operationText = document.getElementById('operation');
    var historyList = document.getElementById('historyList');
    var emptyHistory = document.getElementById('emptyHistory');
    var clearHistoryButton = document.getElementById('clearHistory');
    var buttons = document.querySelectorAll('.btn');
    var storageKey = 'calculatorHistory';

    var firstValue = null;
    var currentOperator = null;
    var shouldResetDisplay = false;

    function getHistory() {
        var savedHistory = localStorage.getItem(storageKey);

        if (!savedHistory) {
            return [];
        }

        try {
            return JSON.parse(savedHistory);
        } catch (error) {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(storageKey, JSON.stringify(history));
    }

    function renderHistory() {
        var history = getHistory();
        var html = '';
        var i;

        for (i = history.length - 1; i >= 0; i -= 1) {
            html += '<li><span>' + history[i].operation + '</span><strong>' + history[i].result + '</strong></li>';
        }

        historyList.innerHTML = html;
        emptyHistory.style.display = history.length ? 'none' : 'block';
    }

    function addToHistory(operation, result) {
        var history = getHistory();

        history.push({
            operation: operation,
            result: result
        });

        saveHistory(history);
        renderHistory();
    }

    function formatNumber(number) {
        if (!isFinite(number)) {
            return 'Error';
        }

        if (Math.round(number) === number) {
            return String(number);
        }

        return String(parseFloat(number.toFixed(10)));
    }

    function calculate(numberOne, numberTwo, operator) {
        if (operator === '+') {
            return numberOne + numberTwo;
        }

        if (operator === '-') {
            return numberOne - numberTwo;
        }

        if (operator === '*') {
            return numberOne * numberTwo;
        }

        if (operator === '/') {
            if (numberTwo === 0) {
                return NaN;
            }

            return numberOne / numberTwo;
        }

        return numberTwo;
    }

    function operatorSymbol(operator) {
        if (operator === '*') {
            return 'x';
        }

        if (operator === '/') {
            return '/';
        }

        if (operator === '-') {
            return '-';
        }

        return '+';
    }

    function clearCalculator() {
        display.value = '0';
        operationText.innerHTML = '&nbsp;';
        firstValue = null;
        currentOperator = null;
        shouldResetDisplay = false;
    }

    function deleteLastDigit() {
        if (shouldResetDisplay || display.value === 'Error') {
            display.value = '0';
            shouldResetDisplay = false;
            return;
        }

        if (display.value.length === 1) {
            display.value = '0';
        } else {
            display.value = display.value.slice(0, -1);
        }
    }

    function inputNumber(number) {
        if (display.value === '0' || shouldResetDisplay || display.value === 'Error') {
            display.value = number;
            shouldResetDisplay = false;
            return;
        }

        display.value += number;
    }

    function inputDecimal() {
        if (shouldResetDisplay || display.value === 'Error') {
            display.value = '0.';
            shouldResetDisplay = false;
            return;
        }

        if (display.value.indexOf('.') === -1) {
            display.value += '.';
        }
    }

    function chooseOperator(operator) {
        var currentValue = parseFloat(display.value);
        var result;

        if (currentOperator && !shouldResetDisplay) {
            result = calculate(firstValue, currentValue, currentOperator);
            display.value = formatNumber(result);
            firstValue = parseFloat(display.value);
        } else {
            firstValue = currentValue;
        }

        currentOperator = operator;
        shouldResetDisplay = true;
        operationText.textContent = formatNumber(firstValue) + ' ' + operatorSymbol(currentOperator);
    }

    function runEquals() {
        var secondValue;
        var result;
        var operation;

        if (!currentOperator || firstValue === null) {
            return;
        }

        secondValue = parseFloat(display.value);
        result = calculate(firstValue, secondValue, currentOperator);
        operation = formatNumber(firstValue) + ' ' + operatorSymbol(currentOperator) + ' ' + formatNumber(secondValue) + ' =';
        result = formatNumber(result);

        display.value = result;
        operationText.textContent = operation;

        if (result !== 'Error') {
            addToHistory(operation, result);
        }

        firstValue = null;
        currentOperator = null;
        shouldResetDisplay = true;
    }

    function handleButtonClick(event) {
        var button = event.currentTarget;
        var number = button.getAttribute('data-number');
        var operator = button.getAttribute('data-operator');
        var action = button.getAttribute('data-action');

        if (number !== null) {
            inputNumber(number);
            return;
        }

        if (operator) {
            chooseOperator(operator);
            return;
        }

        if (action === 'decimal') {
            inputDecimal();
        } else if (action === 'clear') {
            clearCalculator();
        } else if (action === 'delete') {
            deleteLastDigit();
        } else if (action === 'equals') {
            runEquals();
        }
    }

    function handleKeyboard(event) {
        var key = event.key;

        if (key >= '0' && key <= '9') {
            inputNumber(key);
        } else if (key === '.') {
            inputDecimal();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            chooseOperator(key);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            runEquals();
        } else if (key === 'Backspace') {
            deleteLastDigit();
        } else if (key === 'Escape') {
            clearCalculator();
        }
    }

    function bindEvents() {
        var i;

        for (i = 0; i < buttons.length; i += 1) {
            buttons[i].addEventListener('click', handleButtonClick);
        }

        clearHistoryButton.addEventListener('click', function () {
            localStorage.removeItem(storageKey);
            renderHistory();
        });

        document.addEventListener('keydown', handleKeyboard);
    }

    bindEvents();
    renderHistory();
}());
