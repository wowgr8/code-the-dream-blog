import React, { useEffect, useState } from 'react';

const useSemiPersistentState = () => {
  const [searchTerm, setSearchTerm] = useState(localStorage.setItem('search') || ''); //  use the stored value, if a value exists, to set the initial state of the searchTerm in React’s useState Hook. Otherwise, default to our initial state as before

  useEffect(() => { 
    localStorage.setItem('search', searchTerm); // uses local storage to store the searchTerm accompanied by an identifier whenever a user types into the HTML input field
  }, [searchTerm]); // Whenever and wherever the searchTerm state is updated via setSearchTerm, the browser’s local storage will always be in sync with it.
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

  const [searchTerm, setSearchTerm] = useSemiPersistentState('React');  

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter((story) => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return(
    <div>
      <h1>My Hacker Stories</h1>

      <Search onSearch={handleSearch} search={searchTerm} />

      <hr />

      <List list={searchedStories}/>
    </div> 
  )
};

const Search = ({ search, onSearch }) => (
  <div>
    <label htmlFor="search">Search: </label>
    <input 
      id="search"
      type="text" 
      value={search} 
      onChange={onSearch} 
    />
  </div>
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