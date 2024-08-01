

Elliott and Lira derive the following equations for the pressure and temperature of ideal gases in 2D,


(10) $P = \frac{m}{2L^3}(u^2_i + u^2_2 + ...)$

This leads to, 

$nRT = \underline{V} P  =  L^3*\frac{m}{2L^3} \sum_1^N u_i^2$ 

$u_1^2 = u_2^2 = u_{avg}^2$ and $n = N/N_A$, 
 
(11) $RT(2D) = \frac{MW}{2} u_{avg}^2$

In 3D, 

(12) $P = \frac{m}{3L^3}(u^2_i + u^2_2 + ...)$


(13) $\frac{3RT}{2} = \sum_1^N \frac{mu^2_i}{2n} = N_A \frac{m}{2} u_{avg}^2 = \frac{MW}{2} u_{avg}^2$


The basic idea behind the pressure equation is that collisions with the wall impart an average force.  That force is greater per collision if the particles have greater mass (m). The force is imparted more often if there are: (1) more particles (N), (2) the distance between walls (L) is less, or (3) if the particles are moving faster $(u_i)$.  The temperature equation relates the thermal energy to the kinetic energy of the particles.  For ideal gases, there is no potential energy so the internal energy is simply the molecular kinetic energy.  The extension to the repulsive potential recognizes that hard spheres take up space as their diameters become finite.  This leads to more frequent collisions with the wall as the distance traveled between collisions becomes very small.  We can even imagine diameters large enough that the molecules pack tightly against the walls so the pressure diverges.  We call this the “close-packed density.”  The attractive interactions (ie. association, dissociation, and bouncing) pull the molecules together, resulting in a negative contribution to pressure.  For example, when an atom is being pulled to the left by its bonding partner, it does not hit the right wall quite as hard.  Summing up, we can write the pressure as three contributions,
Eqs.(10,12) represent just the ideal gas contribution.  DMD is required to compute the other contributions.


(14) $P = P^{id} + P^{rep} + P^{att}$


Now for a result that you may find surprising, the equation for temperature is the same regardless of potential.  If you consider a thermometer in air, the velocities of its atoms equilibrate with the velocities of the atoms around it because of the conservation of momentum.  Making the air hotter makes the thermometer atoms move faster, which makes the vibrations in the thermometer expand, which causes the mercury to rise up the tube. If you put the thermometer in water at the same temperature, then momentum is still conserved.  Therefore, the velocities of the water atoms must also be the same.  Water in this case (or any liquid) is an example of a fluid with potential energy sufficiently strong that the molecules stick together on average.  The kinetic energy of their motion cannot overcome the potential energy, like the truck that fell into a gorge.  You can check the velocities at various conditions using the “Show Velocities” button and see how the temperatures relate to molecular velocity for liquid or vapor.


These observations border on being profound.  Note that the atoms of the thermometer walls form a covalently bonded solid.  Also, water has covalent bonds.  This means that the thermal (kinetic) energy of an equilibrated system is the same whether it is in the form of gas, liquid, or solid,… bonded or unbonded.  This is known as the “equipartition principle” and it comes up again in many advanced settings.  Another near profundity is that the molecules of a liquid are moving just as fast as those of an equilibrated vapor.  At first thought, it might seem like the liquid molecules are moving slower.


Now that we mention it, how can the liquid molecules be moving just as fast?  If they were moving just as fast, wouldn’t they have enough kinetic energy to escape the attractive well?  The vapor molecules obviously did, so why not the liquid ones?  The way out of this paradox is to consider a vapor molecule being captured by a liquid phase for an adiabatic system.  Since it is adiabatic, energy is conserved.  When the vapor is captured by the liquid, the potential energy of being surrounded by the liquid molecules gets converted to kinetic energy.  That is, the local temperature goes up.  But we were already at the boiling temperature, otherwise the vapor and liquid would not have been equilibriated.  So the rise in temperature must cause “boiling.”  Boiling means one of the atoms from the liquid flies into the vapor.  Keep in mind that all the liquid molecules are not moving at identical speeds.  The one that is moving fastest only needs a nudge to push it over the potential barrier.  When it does escape, its kinetic energy drops while overcoming the potential.  The drop in kinetic energy of the escaping molecule must exactly match the rise in kinetic energy of the captured molecule.  In this way, the *average* kinetic energy remains the same.  The vapor fraction is determined by the total amount of energy in the system, ie. $U = qU_V + (1-q)U^L$.

**The Radial Distribution Function (rdf) and Its Relation to Thermodynamic Properties (Advanced):**


Dividing Eq.14 by $\rho RT$, we obtain the dimensionless form of the Pressure equation 
 

"The Pressure Equation:"  $Z = 1 + Z^{rep} + Z^{att}$         


$Z^{rep}$ and $Z^{att}$ are given in EL chapter 6 as:


$Z^{rep} = -\frac{N_A \rho}{6kT} \int_0^{\sigma}\ g(r) \frac{du}{dr} *4 \pi r^3 dr$


$Z^{att} = -\frac{N_A \rho}{6kT} \int_{\sigma}^{\infty} \ g(r) \frac{du}{dr} *4 \pi r^3 dr$


where g(r) represents the radial distribution function (rdf). 


Noting that (du/dr) for a hard sphere or square well potential at $r=\sigma$ is a (negative) Dirac delta (EL Apx B), we obtain,


$Z^{rep} = 4 \eta g(\sigma)$ where, for a spherical molecule $\eta=\frac{N_A \rho \pi \sigma^3}{6}$


Another expression relates the rdf to the internal energy (also described in EL Ch6):

"The Energy Equation:"  $\frac{U-U^{id}}{RT} = \frac{N_A \rho}{2kT} \int_0^{\infty} \ g(r) u(r) *4 \pi r^2 dr$  


The Energy equation simply states that the total energy is the sum of all molecular energy.  This result is more obvious than the Pressure equation, but closely related.

These equations can be applied in conjunction with the modules' plots of the rdf to develop a deeper understanding of the theoretical relations between energy, pressure, the rdf, and macroscopic model equations like the van der Waals model.
