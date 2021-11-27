package com.mstefanc.moviesapp.moviepack.data.local

import androidx.lifecycle.LiveData
import androidx.room.*
import com.mstefanc.moviesapp.moviepack.data.Movie

// Data Access Object
@Dao
interface MovieDao {
    @Query("SELECT * from movies ORDER BY title ASC")
    fun getAll(): LiveData<List<Movie>>

    @Query("SELECT * FROM movies WHERE _id=:id ")
    fun getById(id: String): LiveData<Movie>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(movie: Movie)

    @Update(onConflict = OnConflictStrategy.REPLACE)
    suspend fun update(movie: Movie) : Int

    @Delete
    suspend fun delete(movie: Movie)

    @Query("DELETE FROM movies")
    suspend fun deleteAll()
}