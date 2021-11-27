package com.mstefanc.moviesapp.moviepack.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.mstefanc.moviesapp.moviepack.data.Movie
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(entities = [Movie::class], version = 1)
abstract class MoviepackDatabase : RoomDatabase() {

    abstract fun movieDao(): MovieDao

    companion object {
        @Volatile
        private var INSTANCE: MoviepackDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): MoviepackDatabase {
            val inst = INSTANCE
            if (inst != null) {
                return inst
            }
            val instance =
                Room.databaseBuilder(
                    context.applicationContext,
                    MoviepackDatabase::class.java,
                    "moviepack_db"
                )
                    .addCallback(WordDatabaseCallback(scope))
                    .build()
            INSTANCE = instance
            return instance
        }

        private class WordDatabaseCallback(private val scope: CoroutineScope) :
            RoomDatabase.Callback() {

            override fun onOpen(db: SupportSQLiteDatabase) {
                super.onOpen(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                       // populateDatabase(database.movieDao())
                    }
                }
            }
        }

        suspend fun populateDatabase(movieDao: MovieDao) {
            movieDao.deleteAll()
            val movie = Movie("1", "Snatch", 1999)
            movieDao.insert(movie)
        }
    }

}