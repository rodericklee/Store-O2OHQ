_.capitalizeAll = function(wordsString) {
  return wordsString.split(' ')
    .map(function(word){
      return word !== 'and' ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(' ');
}
