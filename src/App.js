import React, { useEffect, useReducer, useRef, useState, useCallback } from 'react';

const useSemiPersistentState = (key, initialState) => { // synchronizes the state with the browser’s local storage
  const [value, setValue] = useState(localStorage.getItem(key) || initialState); //  use the stored value, if a value exists, to set the initial state of the searchTerm in React’s useState Hook. Otherwise, default to our initial state as before

  useEffect(() => { 
    localStorage.setItem(key, value); // uses local storage to store the searchTerm accompanied by an identifier whenever a user types into the HTML input field
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

  const handleFetchStories = useCallback(() => { // Memoized handler example
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.hits,
        }); 
      })
      .catch(() =>
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
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

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };
  
  return(
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button 
        type="button"
        disabled={!searchTerm}  
        onClick={handleSearchSubmit}
      >
        Submit
      </button>

      <hr />

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
      <label htmlFor={id}>{children} </label> 
      &nbsp;
      <input 
        id={id}
        ref={inputRef}
        type={type} 
        value={value} 
        onChange={onInputChange} 
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
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </li> 
);

export default App;