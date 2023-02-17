import React, { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './App.module.css';
import { ReactComponent as Check } from './check.svg';
import { ReactComponent as MagGlass } from './magnifying-glass.svg';

const useSemiPersistentState = (key, initialState) => { // synchronizes the state with the browser’s local storage
  const isMounted = useRef(false);
  const [value, setValue] = useState(localStorage.getItem(key) || initialState); //  use the stored value, if a value exists, to set the initial state of the searchTerm in React’s useState Hook. Otherwise, default to our initial state as before

  useEffect(() => { 
    if(!isMounted.current){
      isMounted.current = true;
    } else { 
      console.log('A');
      localStorage.setItem(key, value); // uses local storage to store the searchTerm accompanied by an identifier whenever a user types into the HTML input field
    }
  }, [value, key]); // Whenever and wherever the searchTerm state is updated via setSearchTerm, the browser’s local storage will always be in sync with it.

  return [value, setValue];
};

//A reducer function always receives state and action. Based on these two arguments, a reducer always returns a new state
// Instead of setting the state explicitly with the state updater function from useState, the useReducer state updater function dispatches an action for the reducer. The action comes with a type and an optional payload
const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );  

  const [url, setUrl] = useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = useCallback( async () => { // Memoized handler example
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      }); 
      
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]); 

  useEffect(() => {
    handleFetchStories(); 
  }, [handleFetchStories]); 

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };
  
  return(
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>

      <SearchForm 
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* If the condition is true, the expression after the logical && operator will be the output. If the condition is false, React ignores it and skips the expression. */}
      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading 
        ? (<p>Loading...</p>) 
        : (<List list={stories.data} onRemoveItem={handleRemoveStory} />)
      }
    </div> 
  );
};

const InputWithLabel = ({ id, children, value, type = 'text', onInputChange, isFocused }) => { //  Instead of using the label prop, use the children prop to render everything that has been passed down from above
  const inputRef = useRef();

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return(
    <>
      {/* Everything that’s passed between a component’s elements can be accessed as children in the component and be rendered somewhere. Sometimes when using a React component, you want to have more freedom from the outside regarding what to render on the inside of a component */}
      <label htmlFor={id} className={styles.label}>
        {children} 
      </label> 
      &nbsp;
      <input 
        id={id}
        ref={inputRef}
        type={type} 
        value={value} 
        onChange={onInputChange} 
        className={styles.input}
      />
    </>
  );
}; 

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item 
        key={item.objectID} 
        item={item}
        onRemoveItem={onRemoveItem}
      /> 
    ))}
  </ul>
); 

const Item = ({ item, onRemoveItem }) => (
  <li className={styles.item}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>
      <button 
        type="button" 
        onClick={() => onRemoveItem(item)}  
        className={`${styles.button} ${styles.buttonSmall}`}
      >
        <Check height="18px" width="18px" />
      </button>
    </span>
  </li> 
);

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit, }) => (
  <form onSubmit={onSearchSubmit} className={styles.searchForm}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search <MagGlass height="18px" width="18px"/> :</strong>
    </InputWithLabel>

    <button 
      type="submit"
      disabled={!searchTerm} 
      className={`${styles.button} ${styles.buttonLarge}`}
    >
      Submit
    </button>
  </form>
)

export default App;