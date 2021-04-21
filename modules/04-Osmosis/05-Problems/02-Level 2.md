

**Ion Solvation Versus Ion Pairs**

Set the Water Osmosis Program with the following set of non-default parameters

**Configuration:**

Solvent Density: 62.7 mol/L

Solution Density: 75.5 mol/L

Solute Mole Fraction: 0.05

State: 397 K Isothermal

**Membrane:**

Core Diameter:1.5A

Membrane Thickness:1

Carefully examine the initial system configuration. Here is one view.

![](<./Clip image021.jpg>)

You will notice that the initial configuration mostly consists of ion pairs
(i.e Na+ and Cl- ions are adjacent to each other.

Now start the simulation. Let it run for a few ps (check the metrics button). 
Now re-examine the configuration. You should see very few ion pairs. Here is one possible view

![](<./Clip image022.jpg>)

Here is the same simulation a little later

![](<./Clip image025.jpg>)

Please note that the Na+ are smaller in size and are more difficult to see, 
since they are surrounded by the larger water molecules, but if you rotate the
images you should be able to see them (see later when they are not surrounded by
water).

**Problem 1: Why have the Na+ and Cl- ions moved away from each other?**

Now do this contrasting simulation.

Set all the parameters to the same values as before but in the configuration make the solute concentration 0.2

Now once again examine the initial configuration. Depending upon your view it should like something like this:

![](<./Clip image023.jpg>)

Now start the simulation and let it run for a few ps (at least 4 or more) and then re-examine the configurations.

It would probably look like this.

![](<./Clip image024.jpg>)

You should notice a lot more ion pairs (Na+ can Cl- ions adjacent to each other. The question to address is:

**Problem 2:  why are the ions not as randomly distributed in the solution as you noticed in the last case?**

In the previous most ions were surrounded by water molecules (i.e. the ions were
solvated, but this time most ions seem to be attached/surrounded to/by other ions, and they are certainly not evenly distributed
in the solution.

**Problem 3: Why are you observing a larger fraction of ion pairs at this concentration.**

You should try solutions with lower concentrations, and see if you can find a critical concentration, when the ions switch from being
mostly solvated, to mostly ion pairs. 

**Problem 4: What would that concentration correspond to? Is there any data available in standard handbooks **
for NaCl that you can compare your results to?** **

**Problem 5: If yes, do you find that there is agreement? If not how can you explain the difference?** 

A possible related reference to help you understand all this is

Chemical Physics Letters, **431**,88-93 (2006)

**Problem 6a:  Use the LJ program and initially use the following set of parameters**

membrane: core diameter= 4.0 A; thickness=1.

configuration: solution density =9.9 mole/l; solvent density=9.9 mol/l; solute mole fraction=0.33

state: isothermal = 175 K. 

Run the program till equilibrium is reached. Now examine the density profile only. Did the system undergo
osmosis or reverse osmosis? 

![](<./Clip image032.jpg>)

**Problem 6b: You are only allowed to change one variable from amongst all available to reverse what you observed**
(e.g. osmosis to reverse osmosis). Which variable will you pick, and explain if this variable in unique in accomplishing such a  switch?