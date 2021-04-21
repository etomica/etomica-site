

= The Piston-Cylinder (p-c) =

This example is demonstrated using a 
[visual simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)  Throughout this example, the user will be setting up the simulation's initial conditions and then running the simulation.  Additional help on setting up the initial conditions and running the simulation [can be found here.](http://rheneas.eng.buffalo.edu/wiki/PistonCylinder:Basic_Layout)


Throughout this example, the simulation should be set to run in adiabatic" mode.

1. Set the number of molecules to 3 by moving the slider to the left then pushing the right arrow.  Verify that there are 3 particles by clicking the Configuration tab.  Then click on the Metrics tab.  Push “Start” and count to 15, then push pause.  Report the ns, temperature, density, and pressure, including the standard error of each.  Compare your pressure to that obtained from the ideal gas equation.
1. Reinitialize and vary the number of particles to obtain a density of 2E-6 mol/m2.  Then reinitialize and run until the standard error in pressure is less than 1%.  Report the temperature, and pressure, including the standard error of each.  Also report the simulated time (ns) and number of molecules. Compare your pressure to that obtained from the ideal gas model.
1. Click the “potential” tab, reinitialize, and repeat for “repulsion only” at 2E-6 mol/m2.  Report the temperature, density, and pressure, including the standard error of each.
1. Reinitialize and repeat for “repulsion and attraction” at 2E-6mol/m2.  Report the temperature, density, and pressure, including the standard error of each, and compare with the ideal gas model.  Click on the Plots tab.  Explain why the temperature and pressure histories look this way.

## Solutions 

1.Roughly 170ns (170,000ps) should elapse for an Intel processor of 1.2GHz clock speed.  The temperature remains constant at 300K because there is no way for it to change when there is no potential energy to exchange with the kinetic energy.  Similarly, the density is fixed 4.49E-8 mol/m2.  The pressure is the only property that fluctuates with time.  Its average value is 1.12±0.0016 bar-nm.  This compares to an ideal gas model of:
P==4.49E-8mol/m2*83.14bar-cm3/molK*300K =0.00112bar-cm3/m2. Converting: P=0.00112/(1E6cm3/m3)=1.12E-9bar-m = 1.12bar-nm.  That is pretty close!
  Note that the pressure calculation is based on collisions with the piston (the north wall).  Probably, your current value of pressure is zero.  Can you explain this?  How can the average be finite if the instantaneous values are almost always zero?
1.134 molecules give 2.005E-6, which is as close as you can get by changing the number of particles only.  At a simulation time of 4.3ns, P = 49.87±0.40 bar-nm.  The temperature is constant at 300K.  For the ideal gas model: P=2.005E-6*83.14*300*1000=50.01 bar-nm.
1.At a simulation time of 3.5ns, P = 68.16±0.67 bar-nm.  This took ~1 minute of clock time.  The pressure went up because the repulsive potential causes the molecules to occupy space, reducing the space between molecules and the time until collision with the north wall.
1.At a simulation time of 3.5ns, P = 84.45±0.85 bar-nm and T=494.0±0.8K.  This took ~3 minutes of clock time.  The pressure went up but the attractions should have caused the pressure to come down.  On the other hand, the temperature went up, so we can’t say offhand whether the pressure should have gone up or down.  The ideal gas model gives:
P=2.005E-6*83.14*494*1000=82.3bar-nm, which is pretty close.  So it looks like the attractions and repulsions have nearly cancelled out.  Do you think we should conclude that the ideal gas model works well for the square well fluid?  What experiments would you plan to prove the truth of your answer to this question?