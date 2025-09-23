import type { Book } from './types/types';

const generateFakeData = (count: number): Book[] => {
  const genres = [
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Thriller',
    'Romance',
    'Non-Fiction',
    'History',
    'Biography',
  ];
  const authors = [
    'Ava Chen',
    'Leo Maxwell',
    'Mia Torres',
    'Eli Vance',
    'Zoe Kim',
    'Ian Brooks',
    'Nora Patel',
    'Sam Reed',
  ];
  const titles = [
    'The Quantum Paradox',
    'Echoes of Eternity',
    'The Crimson Cipher',
    'Whispers in the Void',
    'Starlight Serenade',
    'Chronicles of Dust',
    "The Alchemist's Heir",
    'Midnight Bloom',
  ];

  const data: Book[] = [];
  for (let i = 1; i <= count; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)] + ` #${i}`;
    const author = authors[Math.floor(Math.random() * authors.length)];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const publishedYear = Math.floor(Math.random() * (2024 - 1950 + 1)) + 1950;
    // ISBN needs to be unique for keying and lookups
    const isbn = `978-${Math.floor(
      1000000000 + Math.random() * 9000000000
    )}-${i}`;
    data.push({
      Title: title,
      Author: author,
      Genre: genre,
      PublishedYear: publishedYear,
      ISBN: isbn,
    });
  }
  return data;
};

export default generateFakeData;
