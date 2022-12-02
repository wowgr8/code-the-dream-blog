import React, { useEffect, useState } from 'react';

const useSemiPersistentState = (key, initialState) => { // synchronizes the state with the browser’s local storage
  const [value, setValue] = useState(localStorage.getItem(key) || initialState); //  use the stored value, if a value exists, to set the initial state of the searchTerm in React’s useState Hook. Otherwise, default to our initial state as before

  useEffect(() => { 
    localStorage.setItem(key, value); // uses local storage to store the searchTerm accompanied by an identifier whenever a user types into the HTML input field
  }, [value, key]); // Whenever and wherever the searchTerm state is updated via setSearchTerm, the browser’s local storage will always be in sync with it.

  return [value, setValue];
}

const App = () => {
  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    }, 
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    }
  ];

  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );  

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter((story) => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return(
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={handleSearch}
      >
        Search:
      </InputWithLabel>

      <hr />

      <List list={searchedStories}/>
    </div> 
  )
};

const InputWithLabel = ({ id, label, value, type = 'text', onInputChange }) => (
  <>
    <label htmlFor={id}>{label} </label>
    &nbsp;
    <input 
      id={id}
      type={type} 
      value={value} 
      onChange={onInputChange} 
    />
  </>
); 

const List = ({ list }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} /> 
    ))}
  </ul>
); 

const Item = ({ item }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
  </li> 
);

export default App;