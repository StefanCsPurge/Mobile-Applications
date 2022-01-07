package com.mstefanc.moviesapp.moviepack.movie

import android.animation.ObjectAnimator
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
import com.mstefanc.moviesapp.core.TAG
import com.mstefanc.moviesapp.databinding.FragmentMovieEditBinding
import com.mstefanc.moviesapp.moviepack.data.Movie

class MovieEditFragment: Fragment() {
    companion object {
        const val MOVIE_ID = "MOVIE_ID"
    }
    private lateinit var viewModel: MovieEditViewModel
    private var movieId: String? = null
    private var movie: Movie? = null

    private var _binding: FragmentMovieEditBinding? = null

    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View
    {
        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(MOVIE_ID)) {
                movieId = it.getString(MOVIE_ID).toString()
                Log.i(TAG, movieId!!)
            }
        }
        _binding = FragmentMovieEditBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "save movie")
            val m = movie
            if (m != null) {
                m.title = binding.movieTitle.text.toString()
                m.year = binding.movieYear.text.toString().toInt()
                viewModel.saveOrUpdateMovie(m)
            }
        }

        binding.fabDelete.setOnClickListener{
            Log.v(TAG, "delete movie")
            val m = movie
            if (m != null)
                viewModel.deleteMovie(m)
        }

        binding.fabDown.setOnClickListener{
            changeViewPositionByObjectAnimator()
        }
        // binding.movieTitle.setText(movieId)

    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(MovieEditViewModel::class.java)
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_LONG).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigate(R.id.action_MovieEditFragment_to_MovieListFragment)
            }
        })

        val id = movieId
        if (id == null) {
            movie = Movie("", "", 0)
        } else {
            viewModel.getMovieById(id).observe(viewLifecycleOwner, {
                Log.v(TAG, "update movie")
                if (it != null) {
                    movie = it
                    binding.movieTitle.setText(it.title)
                    binding.movieYear.setText(it.year.toString())
                }
            })
        }
    }

    private fun changeViewPositionByObjectAnimator() {
        ObjectAnimator.ofFloat(view, "translationY", 222f).apply {
            duration = 2000
            start()
        }
    }
}