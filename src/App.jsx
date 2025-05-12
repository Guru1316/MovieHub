import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function MovieHub() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [language, setLanguage] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [bookmarked, setBookmarked] = useState(() => {
    const stored = localStorage.getItem('bookmarked');
    return stored ? JSON.parse(stored) : [];
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    document.body.className = `${theme}-theme`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchGenres();
    fetchLanguages();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchMovies(page);
  }, [page, debouncedSearch, selectedGenre, sortBy, language]);

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
        params: {
          api_key: 'cbd90fd270ace23acf8c634f6f4c0290',
          language: 'en-US',
        },
      });
      const sortedGenres = data.genres.sort((a, b) => a.name.localeCompare(b.name));
      setGenres(sortedGenres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const { data } = await axios.get('https://api.themoviedb.org/3/configuration/languages', {
        params: {
          api_key: 'cbd90fd270ace23acf8c634f6f4c0290',
        },
      });
      const sortedLanguages = data.sort((a, b) => a.english_name.localeCompare(b.english_name));
      setAvailableLanguages(sortedLanguages);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchMovies = async (pageNumber) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = debouncedSearch
        ? 'https://api.themoviedb.org/3/search/movie'
        : 'https://api.themoviedb.org/3/discover/movie';

      const { data } = await axios.get(endpoint, {
        params: {
          api_key: 'cbd90fd270ace23acf8c634f6f4c0290',
          language: 'en-US',
          page: pageNumber,
          query: debouncedSearch || undefined,
          with_genres: selectedGenre || undefined,
          sort_by: sortBy || undefined,
          with_original_language: language || undefined,
        },
      });

      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSortBy('');
    setLanguage('');
    setPage(1);
  };

  const toggleBookmark = (movie) => {
    let updated;
    if (bookmarked.find((m) => m.id === movie.id)) {
      updated = bookmarked.filter((m) => m.id !== movie.id);
    } else {
      updated = [...bookmarked, movie];
    }
    setBookmarked(updated);
    localStorage.setItem('bookmarked', JSON.stringify(updated));
  };

  const toggleDescription = (movieId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [movieId]: !prev[movieId]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      <header className="header">
        <h1 className="title">🎬 MovieHub</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="search-bar"
          />
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="filters">
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Default Sort</option>
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="release_date.desc">Newest</option>
            <option value="release_date.asc">Oldest</option>
          </select>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang.iso_639_1} value={lang.iso_639_1}>
                {lang.english_name}
              </option>
            ))}
          </select>

          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </header>

      <main className="movie-grid">
        {loading ? (
          <p className="loading">Loading movies...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/MovieHub.png'
                }
                alt={movie.title}
                className="poster"
              />
              <div className="movie-details">
                <h3 className="movie-title" title={movie.title}>
                  {movie.title}
                </h3>
                <div className="rating">
                  <span>⭐</span>
                  <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <p className="overview">
                  {movie.overview ? (
                    <>
                      {expandedDescriptions[movie.id] 
                        ? movie.overview 
                        : `${movie.overview.substring(0, 150)}`}
                      {movie.overview.length > 150 && (
                        <button 
                          onClick={() => toggleDescription(movie.id)} 
                          className="read-more"
                        >
                          {expandedDescriptions[movie.id] ? ' Show Less' : '... Read More'}
                        </button>
                      )}
                    </>
                  ) : (
                    'No description available.'
                  )}
                </p>
                <button className="bookmark-button" onClick={() => toggleBookmark(movie)}>
                  {bookmarked.find((m) => m.id === movie.id) ? '🔖 Bookmarked' : '📌 Bookmark'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No movies found.</p>
        )}
      </main>

      <div className="pagination">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          ⬅ Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next ➡
        </button>
      </div>

      <button className="scroll-to-top" onClick={scrollToTop}>
        ⬆ Back to Top
      </button>

      <footer className="footer">
        <p>Powered by TMDB 🚀</p>
      </footer>
    </div>
  );
}

export default MovieHub;