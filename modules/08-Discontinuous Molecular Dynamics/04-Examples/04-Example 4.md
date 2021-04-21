

= The Periodic Boundary =

This example is demonstrated using a 
[visual simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)  The simulation should be run in "First Shell" mode.  To enter "First Shell" mode, push the button labeled "First shell".  If the simulation is already running in "First Shell" mode, there will not be a button labeled "First shell".  When running the simulation in "First Shell" mode, the button labeled "Central image" can be pushed to exit "First Shell" mode.


1.Is the motion of these particles indicative of the ideal gas, HS, or SW potential?
1.Assume each box has 10nm sides and that clock seconds are equal to ns.  Estimate the mean squared distance traveled by the red circle per ns (nm²/ns).

## Solutions 
1.The molecules seem to run right over each other. This is indicative of the IG potential.
1.Roughly, the red circle moves up three squares and over one, for a distance of r² = 30² + 10² = 1000 nm².  With 1.2GHz cpu, it takes the red circle roughly 7 s (ie. 7ns) to move that distance.  So the “mean squared velocity” is 143nm²/ns = 0.00143cm²/s.  Note that this “velocity” has the same dimensions as diffusion coefficient.  In fact, this is exactly how we would compute the diffusion coefficient from simulation.  The only difference is that we would need to average all the “velocities” of all the molecules.