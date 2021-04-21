

=Example of Reverse Osmosis in Solutions=

Set the parameters of the program as follows

**Membrane:**

Core diameter: 2.5 A;
Others: Default Value

**Configuration:**

Solvent Density: 0;
Solution Density: Default Value;
Solute Mole Fraction: 0.15

**State:**

Isothermal with Default Temperature

**Start Program**

![](./clip image003.jpg)

You will observe reverse osmosis in the system with ideal selectivity. You will see blue molecules that constitute
the solvent molecules crossing the membrane while the red molecules that are the solute do not cross the membrane.
This is an example of steric reverse osmosis, i.e. the separation that results in this system is possible because of
differences in the sizes of the solute and solvent molecules. The movement of the solvent molecules from the solution
to solvent side will stop, when the chemical potential (or fugacity) of the solvent molecules on both sides becomes equal.

=An interesting Aside=

![](./clip image004.jpg)

Now change the membrane parameters with all the other settings the same, but the tethering constant 1.E4 -- this will effectively 
increase the pore size of the membrane, since with a smaller tethering constant the amplitude of oscillations is larger (you should
notice this when you look at the configuration). With the larger pores you should see solute molecules leak to the solvent section too. Play 
around with the tethering constant and you will see a different rate for solvent and solute flux. Now at equilibrium (it may take a while if
your pore size is not large enough), the chemical potential of both solute and solvent molecules on both sides will be equal.

Can you think of another parameter that will also effectively change the pore size of the membrane?