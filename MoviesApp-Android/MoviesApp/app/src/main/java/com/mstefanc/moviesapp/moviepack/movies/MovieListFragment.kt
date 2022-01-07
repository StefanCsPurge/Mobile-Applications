package com.mstefanc.moviesapp.moviepack.movies

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.mstefanc.moviesapp.R
import com.mstefanc.moviesapp.auth.data.AuthRepository
import com.mstefanc.moviesapp.core.TAG
import com.mstefanc.moviesapp.databinding.FragmentMovieListBinding

class MovieListFragment : Fragment(){
    private var _binding: FragmentMovieListBinding? = null
    private lateinit var movieListAdapter: MovieListAdapter
    private lateinit var moviesModel: MoviesListViewModel
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View
    {
        Log.i(TAG, "onCreateView")
        _binding = FragmentMovieListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return
        }
        setupMovieList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "add new movie")
            findNavController().navigate(R.id.action_MovieListFragment_to_MovieEditFragment)
        }
    }

    private fun setupMovieList() {
        movieListAdapter = MovieListAdapter(this)
        binding.movieList.adapter = movieListAdapter
        moviesModel = ViewModelProvider(this).get(MoviesListViewModel::class.java)
        moviesModel.movies.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update movies")
            movieListAdapter.movies = value
        })

        moviesModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })

        moviesModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
            }
        })
        moviesModel.refresh()
    }

    override fun onDestroyView() {
        ViewModelProvider(this).get(MoviesListViewModel::class.java).emptyMovieLocalStorage()
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }
}