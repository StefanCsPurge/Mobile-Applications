package com.mstefanc.moviesapp.moviepack.data.workers

import android.content.Context
import android.util.Log
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Dispatchers
import androidx.work.Data
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.mstefanc.moviesapp.moviepack.data.Movie
import com.mstefanc.moviesapp.moviepack.data.MovieRepository
import java.util.concurrent.TimeUnit.SECONDS
import com.mstefanc.moviesapp.moviepack.data.remote.MovieApi
import kotlinx.coroutines.launch

class DeleteWorker(
    context: Context,
    workerParams: WorkerParameters,
) : Worker(context, workerParams) {
    private var wp = workerParams.inputData

    override fun doWork(): Result {
        Log.i("PARAMS", wp.toString())
        GlobalScope.launch(Dispatchers.Main) {
            MovieApi.service.delete(wp.getString("id")!!)
        }
        Log.d("DeleteWorker", "movie deleted!")
        return Result.success()
    }
}

