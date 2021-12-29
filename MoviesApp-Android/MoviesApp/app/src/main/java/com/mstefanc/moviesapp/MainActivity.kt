package com.mstefanc.moviesapp

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import android.view.Menu
import android.view.MenuItem
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequest
import androidx.work.WorkManager
import androidx.work.impl.constraints.NetworkState
import com.mstefanc.moviesapp.auth.data.AuthRepository
import com.mstefanc.moviesapp.core.TAG
import com.mstefanc.moviesapp.databinding.ActivityMainBinding
import com.mstefanc.moviesapp.moviepack.data.workers.NotificationWorker

class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        startNotificationJob()

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        val navController = findNavController(R.id.nav_host_fragment_content_main)
        appBarConfiguration = AppBarConfiguration(navController.graph)
        setupActionBarWithNavController(navController, appBarConfiguration)
//        binding.fab.setOnClickListener { view ->
//            Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
//                .setAction("Action", null).show()
//        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        Log.i(TAG, "onCreateOptionsMenu")
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        Log.i(TAG, "onOptionsItemSelected")
        return when (item.itemId) {
            R.id.action_settings -> true
            R.id.action_logout -> {
                AuthRepository.logout()
                findNavController(R.id.nav_host_fragment_content_main).navigate(R.id.FragmentLogin)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        Log.i(TAG, "onSupportNavigateUp")
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration)
                || super.onSupportNavigateUp()
    }

    private fun startNotificationJob() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.METERED)
            .build()

        val theWork = OneTimeWorkRequest.Builder(NotificationWorker::class.java)
            .setConstraints(constraints)
            .build()
        val workId = theWork.id
        WorkManager.getInstance(this).apply {
            // enqueue Work
            enqueue(theWork)
            // observe work status
            getWorkInfoByIdLiveData(workId)
                .observe(this@MainActivity, { status ->
                    val isFinished = status?.state?.isFinished
                    Log.d(TAG, "Job $workId; finished: $isFinished")
                })
        }

    }
}