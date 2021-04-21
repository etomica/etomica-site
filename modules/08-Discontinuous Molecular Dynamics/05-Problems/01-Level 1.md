

**Problem 1**

Compute the time to collision for four repulsive disks bouncing in two dimensions around a square box.  Let the disk diameters, $\sigma = 0.4nm$.  Let the box length, L=5nm. Use initial velocities of (v, v/2.414), (-v,v), (v/1.414,-v/1.414), (-v/1.414,-v/1.414) E.g. $u_{1,x} = v, u_{1,y} = v/2.414$.

1. Compute v initially from Eq. 1.17 assuming a temperature of 298K.
1. Write the vector formula for computing the center to center distance between two disks given their velocities, u, and their positions, $r_0$, at a given time, $t_0$.
1. Compute the times until collision for the molecule in the northwest corner of the box for both walls and particles.  Which occurs first?
1. Write the vector formulas for the positions and velocities of the two disks of part c after the first collision, ignoring wall collisions.

**Problem 2**

This problem uses a  
[piston-cylinder visual simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)  Throughout the problem, the user will be setting up the simulation's initial conditions and then running the simulation.  Additional help on setting up the initial conditions and running the simulation [can be found here.](http://rheneas.eng.buffalo.edu/wiki/PistonCylinder:Basic_Layout)


Throughout this problem, the simulation should be set to run in "adiabatic" mode.


1. Set the number of molecules to 4 by moving the slider to the left then pushing the right arrow.  Check that there are 4 particles by clicking the configuration tab.  Push “Start” and run for at least 1000ps, then push pause.  Report the temperature, density, and pressure, including the standard error of each.  Compare your pressure to that obtained from the ideal gas equation.
1. Reinitialize and vary the number of particles to obtain a density of 2.86E-6 mol/m2.  Then reinitialize and run for 1000ps.  Tinker with the simulation delay slider until you can see some particles moving slow and others moving faster.  Note that the slow particles always stay slow, and the fast particles stay fast. Why is that?  Report the temperature, density, and pressure, including the standard error of each.  Compare your pressure to that obtained from the ideal gas equation.
1. Click the “potential” tab, reinitialize, and repeat for “repulsion only” at 2.86e-6mol/m2.  Tinker with the simulation delay slider until you can see some particles moving slow and others moving faster.  Compare the motions of the repulsion only particles to the ideal gas particles.  Explain the differences.  Report the temperature, density, and pressure, including the standard error of each.
1. Reinitialize and repeat for “repulsion and attraction” at 2.86e-6mol/m2.  Explain why the temperature is constant for ideal gas and repulsion only, but not for repulsion+attraction.  Report the temperature, density, and pressure, including the standard error of each.
1. Click the “potential” tab, reinitialize, and set up for “repulsion only” at 2.86e-6mol/m2.  Run for 1000ps each and tabulate Z while setting the number of particles to 7, 13, 26, 51, 100, 191.  Extrapolate to $N \rightarrow \infty$ by plotting Z vs 1/N, fitting a quadratic trendline, and reporting the intercept.  Note the simulation time required to reach 1000ps for the cases of N=51, 100, 191.

**Problem 3**

This problem uses a  
[square well MD simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)


Throughout this problem, the simulation should be set to run in "adiabatic" mode.

1. Set the number of molecules to 4 by moving the slider to the left then pushing the right arrow.  Check that there are 4 particles by clicking the configuration tab.  Push “Start” and run for at least 1000ps, then push pause.  Tinker with the simulation delay slider until you can see some particles moving slow and others moving faster.  Note that the slow particles always stay slow, and the fast particles stay fast why is that?  Click on the energy tab and observe the energy values.  What are they and how do they vary with time?  Report the temperature, density, energy, and pressure, including the standard error of each.  Compare your pressure to that obtained from the ideal gas equation.
1. Reinitialize and vary the number of particles to obtain a density of 2.86E-6 mol/m2.  Then reinitialize and run for 1000ps.  Tinker with the simulation delay slider until you can see some particles moving slow and others moving faster.  Note that the slow particles always stay slow, and the fast particles stay fast why is that?  Report the temperature, density, and pressure, including the standard error of each.  What length on each side of the square box is consistent with the density reported?
1. Click the “potential” tab, reinitialize, and repeat for “repulsion only” at 2.86E-6mol/m2.  Tinker with the simulation delay slider until you can see some particles moving slow and others moving faster.  Compare the motions of the repulsion only particles to the ideal gas particles.  Explain the differences.  
1. Set the simulation delay slider to "fast." Note the time and run for 1000ps. Report the temperature, density, and pressure, including the standard error of each.  Compute Z=PV/RT (should be dimensionless) and compare to Problem 2.5.  What do you conclude about PBC's relative to the "thermodynamic limit?"
1. Reinitialize and repeat for “repulsion and attraction” at 2.86E-6mol/m2.  Explain why the temperature is constant for ideal gas and repulsion only, but not for repulsion+attraction.  Try starting temperatures of 300 and 84K.  Report the temperature, density, and pressure, including the standard error of each.

**Problem 4**

This problem uses a  
[square well MD simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)


Throughout this problem, the simulation should be set to run in "isothermal" mode.

1. After completing 1.22, simulate 5000ps for “repulsion only” and “repulsion+attraction” at densities of 4.29E-6, 1.45E-6 mol/m2, and 0.725E-6 mol/m2 and temperatures of 300K.  You should pause and reset the averages on the repulsion+attraction simulations after 500ps so the average temperature will approach its final value more quickly.  Plot Z vs. $\rho$ on the same axes for each case while holding temperature constant, where $Z=P/(\rho RT)=PV/RT$.  Note that $\rho (=) mol/m^2$ and Z should be dimensionless.  Explain your observations.