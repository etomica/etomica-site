

On the brine (water) RO module set the parameters at the same values as those of the [electrolyte example](Osmosis/Electrolyte Example).

Those were

**Configuration:**

Solvent Density: 62.7 mol/l; Solution Density: 75.5 mol/l; Solute Mole Fraction: 0.1.

**Solute:**

Default Charge Value of 1e

**State:**

Isothermal 397 K

**Membrane:**

Core Diameter: 1.5 A

Membrane Thickness: 1
rest: default

Recall what the results were in that case. Now change the Solute to a charge of 0 e (i.e uncharged)

Start the program again. Is this what you observe after a few ps.

![](./clip image010.jpg)

![](./clip image011.jpg)

Is this what you see for the density profile. and the configuration?

**Problem 1: Is this membrane selective at all now? Compare the results with those from Example 2 and explain.**

**Problem 2: Compare the flux in the two cases. Which one is higher and why?**

**Problem 3:  The size (core diameter) of the ions is the same in both the cases. Why are there such profound differences observed then.**

**Problem 4:   If you wanted the ions in Example 2 to permeate the membrane,could you do it without setting the solute charge to 0 e, as was done here? **

**Problem 5a:** With the LJ program set calculate the osmotic pressure from the simulation and compare it with the van't Hoff eqn. Here is a parameter set
to start with.

membrane: core diameter: 4.0 A

thickness: 1


configuration:
solution density: 9.9 mole/L
solvent density: 9.9 mol/L

solute mole fraction: 0.2

state: isothermal: 175 K.

![](./clip image031.jpg)

Do the two agree in this case (you should let the program run till the error bar is about 10%.

**Problem 5b:** Now play with the parameters, and find out when there are signicant deviations from the van't Hoff
eqn. Can you explain the reasons for these deviations. You may want to consult the Introduction section, to understand
the approximations in deriving the van't Hoff equation.