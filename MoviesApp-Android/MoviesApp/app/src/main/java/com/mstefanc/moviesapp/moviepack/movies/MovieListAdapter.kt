package com.mstefanc.moviesapp.moviepack.movies

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.mstefanc.moviesapp.R
import com.mstefanc.moviesapp.core.TAG
import com.mstefanc.moviesapp.moviepack.data.Movie
import com.mstefanc.moviesapp.moviepack.movie.MovieEditFragment

class MovieListAdapter(private val fragment: Fragment)
    : RecyclerView.Adapter<MovieListAdapter.ViewHolder>()
{
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView = view.findViewById(R.id.title)
    }

    var movies = emptyList<Movie>()
        @SuppressLint("NotifyDataSetChanged")
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    private var onMovieClick: View.OnClickListener = View.OnClickListener { view ->
        val movie = view.tag as Movie
        fragment.findNavController().navigate(R.id.action_MovieListFragment_to_MovieEditFragment, Bundle().apply {
            putString(MovieEditFragment.MOVIE_ID, movie._id)
        })
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_movie, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val movie = movies[position]
        holder.textView.text = movie.toString()
        holder.itemView.tag = movie
        holder.itemView.setOnClickListener(onMovieClick)
    }

    override fun getItemCount(): Int {
        Log.v(TAG, "getItemCount")
        return movies.size
    }
}