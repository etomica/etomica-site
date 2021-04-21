

Set the Parameters to:

**Configuration:**

Solvent Density: 62.7 mol/L

Solution Density: 75.5 mol/L

Solute Mole Fraction: 0.1

**Solute:**

Default Charge Value of 1e

**State:**
 
Isothermal 397 K

**Membrane:**

Core Diameter: 1.5 A

Membrane Thickness: 1

rest: default

With these parameters start the program. Monitor the movement of water molecules and ions (Na+/Cl-) across the membrane
visually, and using the density profiles, and metrics. You will observe (i) that there is clear evidence of reverse
osmosis in the system, i.e. water is going from the solution side to the solvent side; and no solute molecules move from the 
solution side to the solvent side. This is how the configuration looks like after about 0.8 ps

![](<./Clip image005.jpg>)

You can see visually that there are no ions in the solvent section (middle). To confirm this also examine the density profiles

![](<./Clip image006.jpg>)

Here is something interesting to think about. Notice that the sodium ions (blue) are certainly much smaller than the water molecules
shown in the system. Why have no sodium ions moved across the membrane. Is it because the simulation has not long enough to give them
a chance to cross (well you can run the program much longer to decide this issue), or is there a more subtle or not so subtle reason for this.
We will give you a chance to look at this more carefully in one of the problems.

Now as an aside run the program with the all the parameters the same but in the 

**Configuration:**

Solvent Density: 0

This is what you will see for the the configuration and the Density Profiles

![](<./Clip image007.jpg>)

![](<./Clip image008.jpg>)

Compare these with the previous case. What are your important observations. Is there anything unexpected you have observed?

If you were to guess, in which case did more water molecules cross from the solution side to the solvent side. Would you have
expected more to cross if there was vacuum on the other side (larger hydrostatic driving force?), is that what you observe.