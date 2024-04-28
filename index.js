const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');
const { get } = require('http');

const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
const files = getFiles();
const todos = getTodos();

console.log('Please, write your command!');
readLine(processCommand);


function getFiles() {
    return filePaths.map(path => readFile(path));
}

function getTodos() {
    const todos = [];
    const todoRegex = /\/\/\s*TODO\s*(.*)/gi; // Используем флаги g и i для глобального поиска и игнорирования регистра

    files.forEach(file => {
        file.split('\n').forEach(line => {
            let match;
            while ((match = todoRegex.exec(line)) !== null) {
                let comment = match[1].trim();
                if (comment.startsWith(':')) {
                    comment = comment.slice(1).trim();
                }
                const importance = (comment.match(/!/g) || []).length; // Подсчитываем количество восклицательных знаков
                const todoSplit = comment.split(';').map(str => str.trim());
                let user = '';
                let date = '';
                let commentText = '';
                if (todoSplit.length === 3){
                    user = todoSplit[0].toLowerCase(); 
                    date = new Date(todoSplit[1]); 
                    commentText = todoSplit[2].replace('!', '').trim();
                } else {
                    commentText = comment.replace('!', '').trim();
                }
                todos.push({ 
                    importance, 
                    user, 
                    date, 
                    comment: commentText,
                    filepath: filePaths[files.indexOf(file)]
                });
            }
        });
    });
    
    return todos;
}

function formatDate(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
  
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
  
    return `${day}-${month}-${year}`;
}
  

function showTodos(todos) {
    let maxUserLength = 0;
    let maxDateLength = 0;
    let maxCommentLength = 0;
    let maxFilePathLength = 0;
    todos.forEach(todo => {
        maxUserLength = Math.min(10, Math.max(maxUserLength, todo.user.length));
        maxDateLength = Math.min(10, Math.max(maxDateLength, todo.date.toString().length));
        maxCommentLength = Math.min(50, Math.max(maxCommentLength, todo.comment.length));
        maxFilePathLength = Math.min(75, Math.max(maxFilePathLength, todo.filepath.length));
    });
    header = `  !  |  ${'user'.padEnd(maxUserLength)}  |  ${'date'.padEnd(maxDateLength)}  |  ${'comment'.padEnd(maxCommentLength)}  |  ${'filepath'.padEnd(maxFilePathLength)}`;
    console.log(header);
    console.log('-'.repeat(header.length));
    todos.forEach(todo => {
        const userText = todo.user.length > maxUserLength ? todo.user.slice(0, maxUserLength - 3) + '...' : todo.user;
        const date = todo.date ? formatDate(todo.date) : '';
        const dateText = date.length > maxDateLength ? date.slice(0, maxDateLength - 3) + '...' : date;
        const commentText = todo.comment.length > maxCommentLength ? todo.comment.slice(0, maxCommentLength - 3) + '...' : todo.comment;
        const filepathText = todo.filepath.length > maxFilePathLength ? todo.filepath.slice(0, maxFilePathLength - 3) + '...' : todo.filepath;
        console.log(`  ${todo.importance.toString()}  |  ${userText.padEnd(maxUserLength)}  |  ${dateText.padEnd(maxDateLength)}  |  ${commentText.padEnd(maxCommentLength)}  |  ${filepathText.padEnd(maxFilePathLength)}`);
    });
}

function showImportant() {
    showTodos(todos.filter(todo => todo.importance > 0))
}

function showUser(user) {
    showTodos(todos.filter(todo => todo.user === user.toLowerCase()));
}

function showSortedByImportance() {
    todos.sort((a, b) => b.importance - a.importance);
    showTodos(todos);
}

function showSortedByUser() {
    const users = {};
    let output = [];
    todos.forEach(todo => {
        if (!users[todo.user]) {
                users[todo.user] = [];
        }
        users[todo.user].push(todo);
    });
    
    for (const user in users) {
        if (user === '') {
            continue;
        }
        users[user].forEach(todo => {
            output.push(todo);
        });
    }
    if (users['']){ // show without user
        users[''].forEach(todo => {
            output.push(todo);
        });
    }
    showTodos(output);
}

function showSortedByDate() {
    const withDates = todos.filter(todo => todo.date);
    const withoutDates = todos.filter(todo => !todo.date);
    let output = [];
    withDates.sort((a, b) => a.date - b.date);
    withDates.forEach(todo => {
        output.push(todo);
    });
    withoutDates.forEach(todo => {
        output.push(todo);
    });
    showTodos(output);
}

function filterByDate(dateString) {
    const date = new Date(dateString);
    showTodos(todos.filter(todo => todo.date > date));
}

function processCommand(command) {
    const commandSplit = command.split(' ');
    const action = commandSplit[0];
    const args = commandSplit.slice(1).join(' ');
    switch (action) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            showTodos(todos);
            break;
        case 'important':
            showImportant();
            break;
        case 'user':
            showUser(args);
            break;
        case 'sort':
            switch (args) {
                case 'importance':
                    showSortedByImportance();
                    break;
                case 'user':
                    showSortedByUser();
                    break;
                case 'date':
                    showSortedByDate();
                    break;
                default:
                    console.log('wrong command');
                    break;
            }
            break;
        case 'date':
            filterByDate(args);
            break;
        default:
            console.log('wrong command');
            break;
    }
}


// TESTS


// TODO you can do it!
// toDO cammelCase
//TODO NOSPACE
//    TODO    LOTSOFSPACES
// todo lowercase
// TODO: with colon