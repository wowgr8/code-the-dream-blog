import React, { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import axios from 'axios';
// import styles from './App.module.css';
import styled from 'styled-components';


// When using Styled Components, you are using the JavaScript template literals the same way as JavaScript functions. Everything between the backticks can be seen as an argument and the styled object gives you access to all the necessary HTML elements (e.g. div, h1) as functions. Once a function is called with the style, it returns a React component that can be used in your App component
const StyledContainer = styled.div` 
  height: 100vw;
  padding: 20px;

  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);

  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1` 
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const StyledItem = styled.li` 
  display: flex; 
  align-items: center; 
  padding-bottom: 5px;
`;

const StyledColumn = styled.span` 
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  a{
    color: inherit;
  }
  width: ${(props) => props.width};
`;

const StyledButton = styled.button` 
  background: transparent;
  border: 1px solid #171212; 
  padding: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in;

  // CSS nesting are available in Styled Components by default. Nested elements are accessible and the current element can be selected with the & CSS operator
  &:hover {
    background: #171212;
    color: #ffffff;
  }  
`;

const StyledButtonSmall = styled(StyledButton)` 
  padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)` 
  padding: 10px;
`;

const StyledSearchForm = styled.form` 
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledLabel = styled.label` 
  border-top: 1px solid #171212; 
  border-left: 1px solid #171212; 
  padding-left: 5px;
  font-size: 24px;
`;

const StyledInput = styled.input` 
  border: none;
  border-bottom: 1px solid #171212; 
  background-color: transparent;
  font-size: 24px;
`;

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
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

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
    </StyledContainer> 
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
      <StyledLabel htmlFor={id}>
        {children} 
      </StyledLabel> 
      &nbsp;
      <StyledInput 
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
  <StyledItem>
    <StyledColumn width="40%">
      <a href={item.url}>{item.title}</a>
    </StyledColumn>
    <StyledColumn width="30%">{item.author}</StyledColumn>
    <StyledColumn width="10%">{item.num_comments}</StyledColumn>
    <StyledColumn width="10%">{item.points}</StyledColumn>
    <StyledColumn width="10%">
      <StyledButtonSmall 
        type="button" 
        onClick={() => onRemoveItem(item)}  
      >
        Dismiss
      </StyledButtonSmall>
    </StyledColumn>
  </StyledItem> 
);

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit, }) => (
  <StyledSearchForm onSubmit={onSearchSubmit} >
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <StyledButtonLarge 
      type="submit"
      disabled={!searchTerm} 
    >
      Submit
    </StyledButtonLarge>
  </StyledSearchForm>
)

export default App;