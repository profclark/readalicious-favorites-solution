import { createContext, useState } from "react";
import { useEffect } from "react/cjs/react.development";

const FavoritesContext = createContext({
  getFavorites: () => {},
  addFavorite: (book) => {},
  removeFavorite: (book) => {},
  isFavorite: (book) => {},
});

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = async (book) => {
    const favorite = { book };
    const response = await fetch(
      "https://readalicious-favorites-default-rtdb.firebaseio.com/favorites.json",
      {
        method: "POST",
        body: JSON.stringify(favorite),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("An HTTP error occurred.");
    }

    const data = await response.json();

    setFavorites((prevFavorites) => {
      return [...prevFavorites, { ...favorite, id: data.name }];
    });
  };

  const removeFavorite = async (book) => {
    const favorite = favorites.find((favorite) => favorite.book.id === book.id);

    const response = await fetch(
      `https://readalicious-favorites-default-rtdb.firebaseio.com/favorites/${favorite.id}.json`,
      {
        method: "DELETE",
        body: JSON.stringify(favorite),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    setFavorites((prevFavorites) => {
      return prevFavorites.filter((favorite) => book.id !== favorite.book.id);
    });
  };

  const isFavorite = (book) => {
    return (
      favorites.find((favorite) => favorite.book.id === book.id) !== undefined
    );
  };

  const getFavorites = () => {
    return favorites.map((favorite) => favorite.book);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      const response = await fetch(
        "https://readalicious-favorites-default-rtdb.firebaseio.com/favorites.json"
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      if (data) {
        setFavorites(
          Object.keys(data).map((key) => {
            return {
              id: key,
              book: data[key].book,
            };
          })
        );
      }
    };

    fetchBooks();
  }, []);

  const context = {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={context}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
